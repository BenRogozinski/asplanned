import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import { getSession } from "./session";
import { Logger } from "./logger";
import type { TableRow } from "@/components/DynamicTable/DynamicTable";

export default class Aspen {
  private baseUrl: string;
  public response: Response;
  public document: cheerio.CheerioAPI;
  public form: FormData;
  public url: string;
  #cookies: CookieJar;
  #logger: Logger;

  constructor() {
    this.baseUrl = process.env.ASPEN_URL || "https://aspen.cps.edu/aspen";
    this.response = new Response();
    this.document = cheerio.load("");
    this.form = new FormData();
    this.url = this.baseUrl;
    this.#cookies = new CookieJar();
    this.#logger = new Logger("Aspen");
  }

  // Get an Aspen instance from the current session
  public static async fromSession(): Promise<Aspen> {
    // Get session for current user
    const session = await getSession();
    if (!session) {
      throw new Error("Failed to get user session");
    }

    const aspen = new Aspen();
    await aspen.setCookie("AspenCookie", session.aspenCookie);
    await aspen.setCookie("AspenCookieCORS", session.aspenCookie);
    await aspen.setCookie("deploymentId", "aspen");
    await aspen.setCookie("JSESSIONID", session.aspenSessionId);
    aspen.form.set("org.apache.struts.taglib.html.TOKEN", session.aspenTaglib);

    return aspen;
  }

  // Short method to get a resource
  public async get(path: string, followRedirects: boolean = true): Promise<void> {
    const formattedPath = `${this.baseUrl}/${path.replace(/^\/+/, "")}`;
    this.#logger.debug(`Getting ${formattedPath}`);
    await this.#fetch(formattedPath, {
      method: "GET",
      redirect: followRedirects ? "follow" : "manual"
    });
  }

  // Short method for form submission
  public async submitForm(followRedirects: boolean = true): Promise<void> {
    this.#logger.debug(`Submitting form at ${this.url}`);
    await this.#fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams([...this.form.entries()] as [string, string][]).toString(),
      redirect: followRedirects ? "follow" : "manual"
    });
  }

  // Method to replace the cookie jar
  public async setCookie(name: string, value: string): Promise<void> {
    await this.#cookies.setCookie(`${name}=${value}`, this.baseUrl);
  }

  // Method to dump cookies for session storage
  public dumpCookies() {
    return this.#cookies.getCookies(this.baseUrl);
  }

  // Wrapper for the fetch API with cookie persistence and parsing
  async #fetch(url: string, options: RequestInit): Promise<void> {
    // Add cookie headers to request options
    const cookieHeader = (await this.#cookies.getCookies(url))
      .map(({ key, value }) => `${key}=${value}`)
      .join("; ");
    const headers = new Headers(options.headers);
    headers.set("Cookie", cookieHeader);

    // Make the fetch request with added cookies
    this.response = await fetch(url, { ...options, headers });

    // Store cookies from the response
    const setCookieHeaders = this.response.headers.get("set-cookie")?.split(",") || [];
    await Promise.all(setCookieHeaders.map((cookie) => this.#cookies.setCookie(cookie, this.baseUrl)));

    // Set new URL from response (to handle redirects)
    this.url = this.response.url;

    // Clone response so the raw response
    // can still be used outside this method
    const _response = this.response.clone();

    // Parsing for HTML and XML
    const contentType = _response.headers.get("Content-Type");
    if (contentType?.includes("text/html")) {
      this.document = cheerio.load(await _response.text());
      if (!this.document) {
        throw new Error("Failed to load DOM from Aspen response");
      }
      this.document("input").each((_, element) => {
        const name = this.document(element).attr("name");
        const value = this.document(element).attr("value") || "";
        if (name) this.form.set(name, value);
      });
    } else if (contentType?.includes("text/xml")) {
      this.document = cheerio.load(await _response.text(), { xml: true });
    }
  }
}

// Function to parse basic Aspen tables
export function parseTableData(dom: cheerio.CheerioAPI, tableType: "grid" | "details"): TableRow[] {
  if (tableType === "details") {
    if (!dom("tr[id^='Property']").length) {
      throw new Error("No properties found in the DOM");
    }
    return dom("tr[id^='Property']")
      .map((_, element) => {
        const $ = cheerio.load(element);
        return {
          Field: $(".detailProperty").text().trim(),
          Value: $(".detailValue").text().trim(),
        };
      })
      .get();
  } else {
    return [];
  }
}