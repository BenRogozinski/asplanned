import { blue, green, yellow, red } from "ansis";

export class Logger {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  debug = (message: string) => {
    if (process.env.DEBUG) {
      console.log(`${blue("[DEBUG] " + this.name)}: ${message}`);
    }
  };
  info = (message: string) => console.log(`${green("[INFO] " + this.name)}: ${message}`);
  warning = (message: string) => console.log(`${yellow("[WARNING] " + this.name)}: ${message}`);
  error = (message: string) => console.log(`${red("[ERROR] " + this.name)}: ${message}`);
}