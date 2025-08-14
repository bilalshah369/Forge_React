import React, { useState } from "react";

export default function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Button to open modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Open Modal
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* Modal content */}
          <div
            className="bg-white p-6 rounded shadow-lg relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent click propagation
          >
            <h2 className="text-xl font-bold mb-4">Modal Title</h2>
            <p className="mb-4">
              This is a modal. It won’t close unless you click the close button.
            </p>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
