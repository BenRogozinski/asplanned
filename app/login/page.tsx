"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    const response = await fetch('/api/aspen/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      setErrorMessage(null)
      router.push('/')
    } else {
      const data = await response.json()
      setErrorMessage(data.error)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/asplanned-logo.svg"
          alt="AsPlanned logo"
          width={150}
          height={100}
          priority
        />

        <h1 className={styles.title}>Log In | AsPlanned</h1>

        {errorMessage && (
          <div className={styles.errorcontainer}>
            <p className={styles.errortext}>{errorMessage}</p>
          </div>
        )}

        <form className={styles.loginform} onSubmit={handleSubmit}>
          <div className={styles.loginfield}>
            <input
              className={styles.input}
              type="text"
              name="username"
              placeholder="Aspen username" />
          </div>
          <div className={styles.loginfield}>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Aspen password" />
          </div>
          <button type="submit" className={styles.button}>Log in!</button>
        </form>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          About
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Help
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Contacts
        </a>
      </footer>
    </div>
  );
}