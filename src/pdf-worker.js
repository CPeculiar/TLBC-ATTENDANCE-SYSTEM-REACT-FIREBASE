import { GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.js`;
