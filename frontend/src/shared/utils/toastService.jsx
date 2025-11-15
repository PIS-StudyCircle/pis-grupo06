import { toast } from "react-toastify";

export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

export const showConfirm = (message, onConfirm, onCancel) => {
  let toastId = null;

  const handleClickOutside = (event) => {
    const toastElem = document.getElementById(`toast-${toastId}`);
    if (toastElem && !toastElem.contains(event.target)) {
      toast.dismiss(toastId);
      if (onCancel) onCancel();
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  toastId = toast(
    ({ closeToast }) => {
      // poner id al contenedor para detectarlo
      return (
        <div id={`toast-${toastId}`} className="bg-gray-100 p-4 rounded-lg shadow-md text-center">
          <p className="mb-4 text-gray-800 font-medium">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                onConfirm();
                closeToast();
                document.removeEventListener("mousedown", handleClickOutside);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sí
            </button>
            <button
              onClick={() => {
                if (onCancel) onCancel();
                closeToast();
                document.removeEventListener("mousedown", handleClickOutside);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              No
            </button>
          </div>
        </div>
      );
    },
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      className: "!bg-transparent !shadow-none !p-0 mt-10",
      bodyClassName: "!p-0",
    }
  );

  document.addEventListener("mousedown", handleClickOutside);
};

