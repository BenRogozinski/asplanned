import { blue, green, yellow, red } from "ansis";

export class Logger {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  debug = (message: unknown) => {
    if (process.env.DEBUG) {
      console.log(`${blue("[DEBUG] " + this.name)}: ${message}`);
    }
  };
  info = (message: unknown) => console.log(`${green("[INFO] " + this.name)}: ${message}`);
  warning = (message: unknown) => console.log(`${yellow("[WARNING] " + this.name)}: ${message}`);
  error = (message: unknown) => console.log(`${red("[ERROR] " + this.name)}: ${message}`);
}