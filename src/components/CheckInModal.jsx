import { QRCodeSVG } from "qrcode.react";

export default function CheckInModal({ user, onClose }) {
  const qrValue = `${user._id}|${user.fullName}|${user.email}`;

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=400,width=600");
    const qrElement = document.getElementById("qr-code");
    const canvas = qrElement.querySelector("canvas");
    const image = canvas.toDataURL("image/png");

    printWindow.document.write(`
      <html>
        <head>
          <title>Check-in QR Code</title>
          <style>
            body { text-align: center; font-family: Arial; }
            h1 { color: #333; }
            img { margin: 20px 0; }
            p { color: #666; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Event Check-in</h1>
          <p><strong>${user.fullName}</strong></p>
          <img src="${image}" alt="QR Code" width="300" height="300" />
          <p>Scan this QR code for check-in</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Check-in QR Code
        </h2>
        <p className="text-gray-600 mb-6">{user.fullName}</p>

        <div
          id="qr-code"
          className="bg-white p-4 rounded-lg border-2 border-gray-200 flex justify-center mb-6"
        >
          <QRCodeSVG
            value={qrValue}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Print QR Code
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Close
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          QR Code Data: {qrValue}
        </p>
      </div>
    </div>
  );
}
