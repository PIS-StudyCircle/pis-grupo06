import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function HelpMenu() {

    const location = useLocation();
    const [showHelp, setShowHelp] = useState(false);
    const [helpIndex, setHelpIndex] = useState(0);

    useEffect(() => {
        setHelpIndex(0);
    }, [location.pathname, showHelp]);

    const helpTextByRoute = (path) => {
        const pure = path.split("?")[0].split("#")[0] || "/";
        // /materias
        if (pure === "/" || pure === "/materias") {
        return [
            "Bienvenido a Study Circle.",
            "En esta página podés explorar todas las materias disponibles, buscando por nombre.",
            "Podés guardar tus favoritas desde la estrella.",
            "Clickeando en una materia podés ver los temas de esta, solicitar tutoría o brindar una.",
            "Usá el menú para navegar entre Materias, Tutorías, Mis Clases y Usuarios:",
            "En Tutorías: consultá las tutorías disponibles y solicitadas.",
            "En Mis clases: organiza tus próximas tutorías y las que ya tuviste.",
            "En Usuarios: buscá otros usuarios y mirá sus reseñas.",
            "Desde el icono de perfil podés acceder a tu información personal, editarla o cerrar sesión.",
        ];
        }
        // /materias/:id
        if (/^\/materias\/\d+$/i.test(pure)) {
        return [
            "En esta página ves la información general de la materia y los temas asociados.",
            "Podés elegir entre “Recibir tutoría” para pedir una tutoría como estudiante o “Brindar tutoría” para ofrecerte como tutor. Al hacerlo podés crear nuevos temas si no está el que querés.",
            "También podés consultar las tutorías disponibles sobre un tema clickeando en este.",
        ];
        }
        // /materias/:id/temas/:id
        if (/^\/materias\/\d+\/temas\/\d+$/i.test(pure)) {
        return [
            "Aquí podés ver las tutorías disponibles y solicitadas para este tema.",
            "Podés elegir entre \"Recibir tutoría\" para pedir una tutoría como estudiante, \"Brindar tutoría\" para ofrecerte como tutor o \"Desuscribirme\" si ya no querés participar.",
        ];
        }
        // /tutorias
        if (pure === "/tutorias") {
        return [
            "Aquí podés encontrar todas las tutorías brindadas y solicitadas. Podés buscar por materia o tema, y filtrar por aquellas que no tienen tutor asignado.",
            "Podés unirte como tutor apretando en “ser tutor” o como estudiante apretando en “unirme”.",
        ];
        }
        // /tutorias/:id/elegir_horario_estudiante
        if (/^\/tutorias\/\d+\/elegir_horario_estudiante$/i.test(pure)) {
        return [
            "Estos son los horarios que el tutor tiene disponibles, elegí el rango en el que puedas.",
            "Una vez confirmes, se notificará automáticamente a la otra persona y se agendará la tutoría.",
        ];
        }
        // /tutorias/:id/elegir_horario_tutor
        if (/^\/tutorias\/\d+\/elegir_horario_tutor$/i.test(pure)) {
        return [
            "Podés elegir la cantidad de estudiantes que pueden unirse a la tutoría.",
            "Estos son los horarios que el estudiante tiene disponibles, elegí el rango en el que puedas.",
            "Una vez confirmes, se notificará automáticamente a la otra persona y se agendará la tutoría.",
        ];
        }
        // /tutorias/materia/:id
        if (/^\/tutorias\/materia\/\d+$/i.test(pure)) {
        return [
            "Aquí podés encontrar todas las tutorías actualmente disponibles para esta materia.",
            "Podés buscar por tema o solicitar una nueva si no encontrás la que querés.",
        ];
        }
        // /tutorias/ser_tutor/:id
        if (/^\/tutorias\/ser_tutor\/\d+$/i.test(pure)) {
        return [
            "Aquí podés encontrar todas las tutorías actualmente solicitadas para esta materia.",
            "Podés buscar por tema o crear una nueva si no encontrás la que querés.",
        ];
        }
        // /tutorias/elegir_temas/estudiante|tutor/:id
        if (/^\/tutorias\/elegir_temas\/(estudiante|tutor)\/\d+$/i.test(pure)) {
        return [
            "Seleccioná los temas que quieras para la tutoría o creá nuevos si no los hay.",
        ];
        }
        // /tutorias/crear/:id
        if (/^\/tutorias\/crear\/\d+$/i.test(pure)) {
        return [
            "Seleccioná la modalidad, los cupos y tus horarios disponibles para la tutoría.",
            "Quienes quieran participar elegirán entre estos horarios.",
        ];
        }
        // /tutorias/solicitar/:id
        if (/^\/tutorias\/solicitar\/\d+$/i.test(pure)) {
        return [
            "Seleccioná la modalidad, tus horarios disponibles para la tutoría y dejá un comentario (como tu preferencia de los cupos).",
            "Quien acepte brindar la tutoría elegirá entre estos horarios y definirá el cupo.",
        ];
        }
        // /notificaciones
        if (pure === "/notificaciones") {
        return [
            "En esta pantalla podés ver tus próximas tutorías, pudiendo desuscribirte de una si ya no podés asistir.",
            "También podés ver las tutorías en las que ya participaste y dejar una clasificación al tutor.",
        ];
        }
        // /usuarios
        if (pure === "/usuarios") {
        return [
            "Aquí podés ver todos los usuarios, entrá a un perfil para ver las reseñas sobre el usuario.",
        ];
        }
        // /perfil
        if (pure === "/perfil") {
        return [
            "En tu perfil se muestran tus materias favoritas y las reseñas que recibiste.",
            "Si es tu perfil, desde 'Editar perfil' podés cambiar tu foto, nombre, apellido o descripción.",
        ];
        }
        // /usuarios/:id
        if (/^\/usuarios\/\d+$/i.test(pure)) {
        return [
            "Estás viendo el perfil de otra persona, podés leer las reseñas que recibió y, si compartieron una tutoría, dejarle una nueva.",
        ];
        }
        return [
        "Usá el menú para navegar entre Materias, Tutorías, Mis Clases y Usuarios.",
        ];
    };

    const helpText = helpTextByRoute(location.pathname);
    const totalHelpLines = helpText.length;
    const hasPrevHelp = helpIndex > 0;
    const hasNextHelp = helpIndex < totalHelpLines - 1;

    return (
        <div className="relative">
            <div className="pt-4 pb-5">
            <button
                type="button"
                aria-describedby="navbar_help_tip"
                onClick={() => setShowHelp((v) => !v)}
                className="w-5 h-5 inline-flex items-center justify-center rounded-full border text-[11px] leading-none text-white border-white p-1"
                title="Ayuda"
            >
                ?
            </button>
            </div>

            {showHelp && (
                <div className="dropdown p-3" role="menu">
                    <div className="py-1">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-blue-700">Guía rápida</h3>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-2 text-left">
                            <p className="leading-relaxed">
                                {helpText[helpIndex]}
                            </p>
                        </div>

                        <div className="border-t border-white/10 mt-3 pt-2 flex items-center justify-between">
                            <span className="text-xs opacity-70">
                                {helpIndex + 1} / {helpText.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setHelpIndex(i => Math.max(0, i - 1))}
                                    disabled={helpIndex <= 0}
                                    className="text-xs underline hover:opacity-80 disabled:opacity-40 disabled:no-underline"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() =>
                                    setHelpIndex(i => Math.min(helpText.length - 1, i + 1))
                                    }
                                    disabled={helpIndex >= helpText.length - 1}
                                    className="text-xs underline hover:opacity-80 disabled:opacity-40 disabled:no-underline"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}