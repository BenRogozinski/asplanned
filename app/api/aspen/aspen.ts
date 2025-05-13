/*
Aspen navigator
Mimics navigation and form submission
to use Aspen in a headless context
*/

import axios, { AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

// Utility functions to clean paths
const trimBaseUrl = (url: string) => url.replace(/\/+$/, "");
const trimPath = (path: string) => "/" + path.replace(/^\/+/, "");

// Function to parse form data from HTML
function parseForm(response: AxiosResponse): Record<string, string> {
  const html = response.data;
  const $ = cheerio.load(html);

  const form: Record<string, string> = {};
  $("input").each((_, element) => {
    const name = $(element).attr("name");
    const value = $(element).attr("value") || "";
    if (name) {
      form[name] = value;
    }
  });

  return form;
}

// Error class for Authentication errors
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
  private client: ReturnType<typeof wrapper>;

  constructor(base_url: string) {
    this.base_url = trimBaseUrl(base_url);
    this.url = this.base_url;
    this.form = {};

    this.jar = new CookieJar();
    this.client = wrapper(axios.create({ jar: this.jar, withCredentials: true }));
  }

  // Load page, parse form, save cookies
  async navigate(path: string) {
    const trimmedPath = trimPath(path);
    this.url = this.base_url + trimmedPath;

    try {
      const response = await this.client.get(this.url, { maxRedirects: 5 });

      if (response.status === 404) {
        throw new AspenAuthenticationError("404 Not Found: Unable to navigate to the specified path.");
      }

      this.form = parseForm(response);

      // Update URL after any redirect
      if (response.request?.res?.responseUrl) {
        this.url = response.request.res.responseUrl;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new AspenAuthenticationError("404 Not Found: Unable to navigate to the specified path.");
        }
        throw new Error(`Axios error: ${error.message}`);
      } else if (error instanceof Error) {
        throw new Error(`Unexpected error: ${error.message}`);
      } else {
        throw new Error("Unknown error occurred while navigating.");
      }
    }
  }

  // Submit form and parse result
  async submit() {
    try {
      const response = await this.client.post(this.url, new URLSearchParams(this.form).toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        maxRedirects: 5
      });

      if (response.status === 404) {
        throw new AspenAuthenticationError("404 Not Found: Unable to submit the form.");
      }

      this.form = parseForm(response);

      // Update URL after any redirect
      if (response.request?.res?.responseUrl) {
        this.url = response.request.res.responseUrl;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new AspenAuthenticationError("404 Not Found: Unable to submit the form.");
        }
        throw new Error(`Axios error: ${error.message}`);
      } else if (error instanceof Error) {
        throw new Error(`Unexpected error: ${error.message}`);
      } else {
        throw new Error("Unknown error occurred while submitting the form.");
      }
    }
  }

  // Modify form values
  setField(name: string, value: string) {
    this.form[name] = value;
  }

  async getCookies() {
    return this.jar.getCookies(this.url);
  }
}