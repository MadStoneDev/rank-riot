"use client";

import { useState, useRef, useEffect } from "react";

export default function OtpInput() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Focus on first input on component mount, but only on desktop
  // This avoids potential mobile keyboard issues
  useEffect(() => {
    // Simple desktop detection
    const isDesktop = window.innerWidth > 768 && !("ontouchstart" in window);

    if (isDesktop && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    // Handle the case where users input multiple digits (happens on some mobile keyboards)
    // Take the last character entered if multiple are provided
    const lastChar = value.slice(-1);

    // Only accept numbers
    if (!/^\d*$/.test(lastChar)) return;

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Focus management for next input field
    // This is wrapped in setTimeout to help with mobile keyboard issues
    if (lastChar && index < 5) {
      setTimeout(() => {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
          // Select any existing content to ensure it gets replaced on typing
          nextInput.select();
        }
      }, 10);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index]) {
        // If current field has a value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // If current field is empty, move to previous field
        setTimeout(() => {
          const prevInput = inputRefs.current[index - 1];
          if (prevInput) {
            prevInput.focus();
            // Select any existing content
            prevInput.select();
          }
        }, 10);
      }
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
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
      setTimeout(() => {
        const nextInput = inputRefs.current[digits.length];
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    }
  };

  // Handle container click to focus on the first empty input
  // This helps on mobile when clicking anywhere in the container
  const handleContainerClick = () => {
    // Find the first empty input or the last input if all filled
    const firstEmptyIndex = otp.findIndex((digit) => digit === "") || 5;
    inputRefs.current[firstEmptyIndex]?.focus();
  };

  // Combine all digits into a single OTP value for the form
  const combinedOtp = otp.join("");

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="mb-4 px-2"
    >
      <div className="flex items-center justify-between">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="tel" // Better than "text" for mobile number keyboards
            inputMode="numeric"
            pattern="\d*" // Additional help for iOS
            autoComplete="one-time-code"
            maxLength={1}
            className="w-12 h-12 text-center text-xl font-bold border border-neutral-300 rounded-md mx-1 focus:outline-none focus:ring-2 focus:ring-primary"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            // Additional mobile-friendly attributes
            autoCorrect="off"
            aria-label={`Digit ${index + 1} of verification code`}
          />
        ))}
      </div>

      {/* Hidden input to store the combined OTP value for form submission */}
      <input type="hidden" name="otp" value={combinedOtp} />
    </div>
  );
}
