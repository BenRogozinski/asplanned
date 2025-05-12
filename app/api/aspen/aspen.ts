/*
Aspen navigator
Mimics navigation and form submission
to use Aspen in a headless context
*/

import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

// Utility functions to clean paths
const trimBaseUrl = (url: string) => url.replace(/\/+$/, "");
const trimPath = (path: string) => "/" + path.replace(/^\/+/, "");

// Function to parse form data from HTML
function parseForm(response: any): Record<string, string> {
  const html = response.data;
  const $ = cheerio.load(html);

  let form: Record<string, string> = {};
  $("input").each((_, element) => {
    const name = $(element).attr("name");
    const value = $(element).attr("value") || "";
    if (name) {
      form[name] = value;
    }
  });

  return form;
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
      this.form = parseForm(response);

      // Update URL after any redirect
      if (response.request?.res?.responseUrl) {
        this.url = response.request.res.responseUrl;
      }
    } catch (e) {
      throw new Error("Error connecting to Aspen");
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

      this.form = parseForm(response);

      // Update URL after any redirect
      if (response.request?.res?.responseUrl) {
        this.url = response.request.res.responseUrl;
      }
    } catch (e) {
      throw new Error("Error connecting to Aspen");
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