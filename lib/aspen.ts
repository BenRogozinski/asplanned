/*
Aspen Navigator
Mimics navigation and form submission
to use Aspen in a headless context.
*/

import { Cookie, CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import { getSession } from "./session";
import { Logger } from "./logger";

const logger = new Logger("aspen");

// Utility function to clean path
const trimPath = (path: string): string => `/${path.replace(/^\/+/, "")}`;

// Function to parse form data from HTML
function parsePage(responseText: string): { form: Record<string, string>; dom: cheerio.CheerioAPI } {
  const $ = cheerio.load(responseText);
  const form: Record<string, string> = {};

  $("input").each((_, element) => {
    const name = $(element).attr("name");
    const value = $(element).attr("value") || "";
    if (name) form[name] = value;
  });

  return { form, dom: $ };
}

// Custom error class for authentication errors
class AspenAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AspenAuthenticationError";
  }
}

// Main Aspen Navigator class
export class AspenNavigator {
  public base_url: string;
  public url: string;
  public response: Response | null;
  public form: Record<string, string>;
  public dom: cheerio.CheerioAPI
  public jar: CookieJar;

  constructor(jar: CookieJar = new CookieJar()) {
    this.base_url = "https://aspen.cps.edu/aspen";
    this.url = this.base_url;
    this.response = null;
    this.form = {};
    this.dom = cheerio.load("");
    this.jar = jar;
  }

  // Load page, parse form, save cookies
  async navigate(path: string, parseDom: boolean = true, followRedirects: boolean = true): Promise<void> {
    this.url = this.base_url + trimPath(path);

    logger.debug(`Navigating to ${this.url}`);

    try {
      this.response = await this.fetchWithCookies(this.url, {
        method: "GET",
        redirect: followRedirects ? "follow" : "manual",
      });

      if (this.response.status === 404) {
        throw new AspenAuthenticationError("404 Not Found: Unable to navigate to the specified path.");
      }

      if (parseDom) {
        const responseText = await this.response.text();
        ({ form: this.form, dom: this.dom } = parsePage(responseText));
      }

      // Update URL after any redirect
      if (this.url !== this.response.url) {
        logger.debug(`New URL is ${this.response.url}`);
      }
      this.url = this.response.url;
    } catch (error) {
      this.handleError(error, "navigate");
    }
  }

  // Submit form and parse result
  async submit(): Promise<void> {
    logger.debug(`Submitting form at ${this.url}`);

    try {
      this.response = await this.fetchWithCookies(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(this.form).toString(),
        redirect: "follow",
      });

      if (this.response.status === 404) {
        throw new AspenAuthenticationError("404 Not Found: Unable to submit the form.");
      }

      const responseText = await this.response.text();
      ({ form: this.form, dom: this.dom } = parsePage(responseText));

      // Update URL after any redirect
      if (this.url !== this.response.url) {
        logger.debug(`New URL is ${this.response.url}`);
      }
      this.url = this.response.url;
    } catch (error) {
      this.handleError(error, "submit");
    }
  }

  // Modify form values
  setField(name: string, value: string): void {
    logger.debug(`Setting form field '${name}' to '${name !== "password" ? value : "********"}'`);
    this.form[name] = value;
  }

  // Retrieve cookies
  async getCookies(): Promise<Cookie[]> {
    return this.jar.getCookies(this.url);
  }

  // Generate Cookie header string
  private async getCookieHeader(): Promise<string> {
    const cookies = await this.getCookies();
    return cookies.map((cookie) => `${cookie.key}=${cookie.value}`).join("; ");
  }

  // Fetch with cookies
  private async fetchWithCookies(url: string, options: RequestInit): Promise<Response> {
    const cookieHeader = await this.getCookieHeader();
    const headers = new Headers(options.headers);
    headers.set("Cookie", cookieHeader);

    const response = await fetch(url, { ...options, headers });

    // Save cookies from the response
    const setCookieHeaders = response.headers.get("set-cookie");
    if (setCookieHeaders) {
      await Promise.all(
        setCookieHeaders.split(",").map((cookie) => this.jar.setCookie(cookie, url))
      );
    }

    return response;
  }

  // Handle errors
  private handleError(error: unknown, action: string): void {
    if (error instanceof Error) {
      throw new Error(`Unexpected error during ${action}: ${error.message}`);
    }

    throw new Error(`Unknown error occurred during ${action}.`);
  }
}

// Function to initialize and return an AspenNavigator instance
export async function getNavigator(): Promise<AspenNavigator | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  logger.debug("Creating navigator for current session");

  const jar = new CookieJar();
  const baseUrl = "https://aspen.cps.edu/";

  await jar.setCookie(`AspenCookie=${session.aspenCookie}`, baseUrl);
  await jar.setCookie(`AspenCookieCORS=${session.aspenCookie}`, baseUrl);
  await jar.setCookie("deploymentId=aspen", `${baseUrl}aspen`);
  await jar.setCookie(`JSESSIONID=${session.aspenSessionId}`, `${baseUrl}aspen`);

  const nav = new AspenNavigator(jar);

  nav.setField("org.apache.struts.taglib.html.TOKEN", session.aspenTaglib);

  return nav;
}

export const absenceCodes = {
  "A": ""
}