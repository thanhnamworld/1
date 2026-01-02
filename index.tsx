
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Hiển thị lỗi trực tiếp lên màn hình nếu có lỗi nghiêm trọng xảy ra
window.onerror = (message, source, lineno, colno, error) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.background = '#fee2e2';
  errorDiv.style.color = '#991b1b';
  errorDiv.style.padding = '20px';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = `
    <h1 style="font-size: 18px; font-weight: bold;">Lỗi Khởi Động Ứng Dụng:</h1>
    <p>${message}</p>
    <p style="font-size: 12px; opacity: 0.7;">Tại: ${source}:${lineno}</p>
    <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #991b1b; color: white; border: none; border-radius: 4px; cursor: pointer;">Tải lại trang</button>
  `;
  document.body.appendChild(errorDiv);
};

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Render error:", error);
}
