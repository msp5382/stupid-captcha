import axios from "axios";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import captcha from "../services/google-recaptcha";

export function getStaticProps() {
  const TARGET = process.env.CAPTCHA;

  let _captchaToUse = [];
  for (let i = 0; i < TARGET; i++) {
    _captchaToUse.push("cap" + i);
  }
  return { props: { _captchaToUse, TARGET } };
}

export default function Home({ TARGET, _captchaToUse }) {
  const [banner1, setBanner1Img] = useState("1");
  const [banner2, setBanner2Img] = useState("3");
  useEffect(() => {
    const imgFlash = setInterval(() => {
      if (banner1 === "1") {
        setBanner1Img("2");
        setBanner2Img("4");
      } else {
        setBanner1Img("1");
        setBanner2Img("3");
      }
    }, 500);
    return () => clearInterval(imgFlash);
  });
  // email
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [email, setEmail] = useState("");

  // wining screen
  const [showWiningScreen, setShowWiningScreen] = useState(false);
  // Captcha

  const manuallyKill = (id) =>
    (window.document.getElementById(id).innerHTML = "");

  const captchaCreateHandler = (_grecaptcha, el, callback) => {
    _grecaptcha.render(el, {
      //sec 6LeFoX8bAAAAAO5CqLEZutTRtoKe5C1X5IEbH_Ni
      sitekey: "6LeFoX8bAAAAAGpG7VgmdwtZd4RgQ4dunoXK5OJ8",
      callback: callback,
      theme: "light",
    });
  };

  const [captchaToUse, setCaptcha] = useState(_captchaToUse);
  const [completed, setCompleted] = useState(0);
  const [ticket, setTicket] = useState("");
  const verification = [];

  let capCount = 0;
  const emailRef = useRef();

  emailRef.current = email;

  const completeCallback = async (token) => {
    console.log("complete", emailRef.current);
    try {
      const { data } = await axios.get(
        `/api/verify?token=${token}&email=${emailRef.current}`
      );
      verification.push(data);
      capCount++;
      setCompleted(capCount);
      if (capCount == TARGET) {
        //win
        const { data } = await axios.post("/api/verify_all", {
          tokens: verification.map(({ token }) => token),
        });

        console.log(data);
        setTicket(data.res);
        setShowWiningScreen(true);
      } else {
        setTimeout(() => manuallyKill("cap" + (capCount - 1)), 2000);
        captchaCreateHandler(grecaptcha, "cap" + capCount, completeCallback);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    window.onloadCallback = () => {
      try {
        captchaCreateHandler(grecaptcha, "cap0", completeCallback);
      } catch (e) {
        console.error(e);
      }
    };
    captcha();
  }, []);
  return (
    <div className="mx-auto container max-w-lg mt-5">
      <img src={`./banner-casino-${banner2}.png`} className="mt-3 mb-5" />
      {showEmailForm ? (
        <>
          <input
            placeholder="Your email ?"
            type="email"
            className="w-full p-2 border"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
          />
          <div className="flex-row flex justify-end mt-2">
            <div
              onClick={() => {
                setShowEmailForm(false);
              }}
              className="bg-black p-1 rounded text-white w-min cursor-pointer"
            >
              Submit
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      {showWiningScreen ? (
        <>
          <p>Your code is {ticket}</p>
          <p>
            you can redeem it{" "}
            <a
              className="text-blue-600 underline"
              href="https://www.eventpop.me/e/11387"
            >
              here
            </a>
          </p>
        </>
      ) : (
        <>
          <div className={showEmailForm ? `hidden` : `block`}>
            Complete Captcha to get ticket
            {captchaToUse.map((id) => (
              <div id={id}></div>
            ))}
            Completed {completed}/{TARGET}
          </div>
        </>
      )}

      <img src={`./banner-casino-${banner1}.png`} className="mt-3 " />
    </div>
  );
}
