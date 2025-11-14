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
                "Usá el menú para navegar entre Materias, Tutorías, Mis Clases y Usuarios.",
                "En Tutorías: consultá las tutorías disponibles y solicitadas.",
                "En Mis clases: organiza tus próximas tutorías y las que ya tuviste.",
                "En Usuarios: buscá otros usuarios y mirá sus reseñas.",
                "Desde el icono de perfil podés acceder a tu información personal, editarla o cerrar sesión.",
                "Desde la campana podés ver tus notificaciones sobre tus actividades.",
            ];
        }
        // /materias/:id
        if (/^\/materias\/\d+$/i.test(pure)) {
            return [
                "En esta página ves la información general de la materia y los temas asociados.",
                "Podés elegir entre “Recibir tutoría” para pedir una tutoría como estudiante o “Brindar tutoría” para ofrecer una tutoría en la que serás tutor de algún tema de la materia.",
                "Al crear una tutoría podés crear nuevos temas si no están los que querés.",
                "También podés consultar las tutorías disponibles sobre un tema clickeando en el mismo.",
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
                "Clickeando en una tutoría podés ver más detalles sobre esta.",
                "Podés unirte como tutor haciendo click en “ser tutor” o como estudiante en “unirme”.",
            ];
        }
        // /tutorias/:id
        if (/^\/tutorias\/\d+$/i.test(pure)) {
            return [
                "En esta página podés ver toda la información de la tutoría.",
                "Una vez haya un tutor y al menos un estudiante, tendrán disponible un chat para coordinar los detalles entre los participantes. Este chat ya no será accesible una vez finalizada la tutoría.",
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
                "El primer estudiante que se una elegirá entre estos horarios para definir el horario final.",
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
                "También podés ver las tutorías en las que ya participaste y dejar un feedback al tutor.",
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
                "En tu perfil se muestran tus materias favoritas, las reseñas y el promedio de puntuaciones que recibiste.",
                "Podés generar un avatar con IA haciendo click en \"Editar con IA\".",
            ];
        }
        // /usuarios/:id
        if (/^\/usuarios\/\d+$/i.test(pure)) {
            return [
                "Estás viendo el perfil de otra persona, podés leer las reseñas que recibió y, si compartieron una tutoría, dejarle una nueva si aún no lo hiciste. Si ya dejaste una reseña, podés editarla o eliminarla.",
            ];
        }
        // /editar-perfil
        if (pure === "/editar-perfil") {
            return [
                "Desde esta página podés editar tu información personal: nombre, apellido, descripción y foto de perfil.",
                "Podés generar un avatar con IA haciendo click en \"Crear con IA\".",
            ];
        }
        // /avatar/elegir_tipo
        if (pure === "/avatar/elegir_tipo") {
            return [
                "Generá un avatar desde cero con IA.",
            ];
        }
        // /avatar/crear
        if (pure === "/avatar/crear") {
            return [
                "Escribí una descripción para generar un avatar con IA.",
                "Una vez generado, podés hacer una nueva o guardar el avatar si te gustó.",
            ];
        }
        return [
        "Usá el menú para navegar entre Materias, Tutorías, Mis Clases y Usuarios.",
        ];
    };

    const helpText = helpTextByRoute(location.pathname);

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