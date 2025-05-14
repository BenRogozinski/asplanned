/*
Aspen navigator
Mimics navigation and form submission
to use Aspen in a headless context
*/

import axios, { AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { Cookie, CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

// Utility functions to clean paths
const trimBaseUrl = (url: string): string => url.replace(/\/+$/, "");
const trimPath = (path: string): string => `/${path.replace(/^\/+/, "")}`;

// Function to parse form data from HTML
function parsePage(response: AxiosResponse): { form: Record<string, string>; dom: cheerio.CheerioAPI } {
  const $ = cheerio.load(response.data);
  const form: Record<string, string> = {};

  $("input").each((_, element) => {
    const name = $(element).attr("name");
    const value = $(element).attr("value") || "";
    if (name) form[name] = value;
  });

  return { form, dom: $ };
}

// Error class for authentication errors
class AspenAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AspenAuthenticationError";
  }
}

// Main Aspen navigator class
export class AspenNavigator {
  public base_url: string;
  public url: string;
  public form: Record<string, string>;
  public jar: CookieJar;
  public dom: cheerio.CheerioAPI | null;
  private client: ReturnType<typeof wrapper>;

  constructor(base_url: string, jar?: CookieJar) {
    this.base_url = trimBaseUrl(base_url);
    this.url = this.base_url;
    this.form = {};
    this.dom = null;
    this.jar = jar || new CookieJar();
    this.client = wrapper(axios.create({ jar: this.jar, withCredentials: true }));
  }

  // Load page, parse form, save cookies
  async navigate(path: string): Promise<void> {
    this.url = this.base_url + trimPath(path);

    try {
      const response = await this.client.get(this.url, { maxRedirects: 5 });

      if (response.status === 404) {
        throw new AspenAuthenticationError("404 Not Found: Unable to navigate to the specified path.");
      }

      ({ form: this.form, dom: this.dom } = parsePage(response));

      // Update URL after any redirect
      if (response.request?.res?.responseUrl) {
        this.url = response.request.res.responseUrl;
      }
    } catch (error: unknown) {
      this.handleError(error, "navigate");
    }
  }

  // Submit form and parse result
  async submit(): Promise<void> {
    try {
      const response = await this.client.post(
        this.url,
        new URLSearchParams(this.form).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          maxRedirects: 5,
        }
      );

      if (response.status === 404) {
        throw new AspenAuthenticationError("404 Not Found: Unable to submit the form.");
      }

      ({ form: this.form, dom: this.dom } = parsePage(response));

      // Update URL after any redirect
      if (response.request?.res?.responseUrl) {
        this.url = response.request.res.responseUrl;
      }
    } catch (error: unknown) {
      this.handleError(error, "submit");
    }
  }

  // Modify form values
  setField(name: string, value: string): void {
    this.form[name] = value;
  }

  // Retrieve cookies
  async getCookies(): Promise<Cookie[]> {
    return this.jar.getCookies(this.url);
  }

  // Handle errors
  private handleError(error: unknown, action: string): void {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new AspenAuthenticationError(`404 Not Found: Unable to ${action}.`);
      }
      throw new Error(`Axios error during ${action}: ${error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Unexpected error during ${action}: ${error.message}`);
    } else {
      throw new Error(`Unknown error occurred during ${action}.`);
    }
  }
}