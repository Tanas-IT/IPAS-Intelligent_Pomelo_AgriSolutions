import { AnswerData } from "@/types";
import { getAnswerParts } from "@/utils";
import { useEffect, useRef, useState } from "react";

const AnimatedAnswer = ({ data, onDone }: { data: AnswerData; onDone?: () => void }) => {
  const parts = getAnswerParts(data);

  const [step, setStep] = useState(0); // phần đang gõ (0: summary, 1: details,...)
  const [typedText, setTypedText] = useState("");
  const iRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step >= parts.length) {
      onDone?.(); // ✅ Chỉ gọi khi typing xong toàn bộ
      return;
    }

    const current = parts[step];
    const fullText = current.value ?? ""; // fallback nếu value là undefined hoặc null
    iRef.current = 0;
    setTypedText("");

    intervalRef.current = setInterval(() => {
      const i = iRef.current;
      if (i < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(i));
        iRef.current += 1;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          setStep((prev) => prev + 1);
        }, 200);
      }
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step]);

  return (
    <div>
      <h4 style={{ marginBottom: "12px", color: "#333" }}>{data.title}</h4>
      {parts.slice(0, step).map((p) => (
        <p key={p.key} style={{ margin: "4px 0", lineHeight: 1.6 }}>
          {p.label && <strong style={{ color: "#222" }}>{p.label}: </strong>}
          {p.value}
        </p>
      ))}
      {step < parts.length && (
        <p style={{ margin: "4px 0", lineHeight: 1.6 }}>
          {parts[step].label && <strong style={{ color: "#222" }}>{parts[step].label}: </strong>}
          {typedText}
        </p>
      )}
    </div>
  );
};

export default AnimatedAnswer;
