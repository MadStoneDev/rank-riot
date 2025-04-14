"use client";

import { useState, useRef, useEffect } from "react";

export default function OtpInput() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Focus on first input on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    // Only accept numbers
    if (!/^\d*$/.test(value)) return;

    // Only accept one digit
    const digit = value.substring(0, 1);

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // If user entered a digit and there's a next input, focus on it
    if (digit && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // If backspace is pressed and current field is empty, focus on previous field
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // If pasted content is not numbers only, ignore
    if (!/^\d+$/.test(pastedData)) return;

    // Fill in the OTP inputs with pasted digits
    const digits = pastedData.substring(0, 6).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    // Focus on appropriate field after paste
    if (digits.length < 6) {
      const nextInput = inputRefs.current[digits.length];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Combine all digits into a single OTP value for the form
  const combinedOtp = otp.join("");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className="w-12 h-12 text-center text-xl font-bold border border-neutral-300 rounded-md mx-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      {/* Hidden input to store the combined OTP value for form submission */}
      <input type="hidden" name="otp" value={combinedOtp} />
    </div>
  );
}
