import { InlineWidget } from "react-calendly";

export default function BookingPage() {
  const tutor = {
    name: "Agustín Castro",
    subject: "Programación Web",
    topic: "Introducción a React y Calendly",
    description:
      "Sesión de tutoría personalizada donde veremos conceptos básicos de React, integración de APIs y gestión de calendarios.",
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <header
            style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", 
                color: "white",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
            >
            <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem", fontWeight: "bold" }}>
                {tutor.subject}
            </h1>
            <h2 style={{ margin: 0, fontSize: "1.2rem", opacity: 0.9 }}>
                Tutor: {tutor.name}
            </h2>
            <h3 style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontStyle: "italic" }}>
                Tema: {tutor.topic}
            </h3>
            <p style={{ marginTop: "1rem", lineHeight: 1.6, fontSize: "1rem" }}>
                {tutor.description}
            </p>
      </header>


      {/* Calendly */}
      <section>
        <InlineWidget
            url="https://calendly.com/agustincastro2003/probando"
            styles={{
                height: "780px", // Esto es para que no aparezca la barra del costado (para subir y bajar)
                width: "100%",
            }}
            />
      </section>
    </div>
  );
}
