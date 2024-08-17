import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useSwipeable } from "react-swipeable";
import { FaRegFilePdf } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Card,
} from "react-bootstrap";

// Set the worker source (required for react-pdf to work)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const goToPage = (page) => {
    setPageNumber(page);
  };

  // const previousPage = () => {
  //   changePage(-1);
  // };

  // const nextPage = () => {
  //   changePage(1);
  // };

  const handlers = useSwipeable({
    onSwipedLeft: () => changePage(1),
    onSwipedRight: () => changePage(-1),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handlePageNumberChange = (event) => {
    const newPageNumber = parseInt(event.target.value, 10);
    if ((newPageNumber) => 0 && newPageNumber <= numPages) {
      goToPage(newPageNumber);
    }
  };

  return (
    <div className="pdf-viewer" {...handlers} style={{ textAlign: "center" }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={console.error}
        loading={<div>Loading PDF...</div>} // Add a loading indicator
      >
        <Page
          pageNumber={pageNumber}
          width={window.innerWidth * 0.9}
          renderTextLayer={false} // Disable text layer to speed up rendering
          renderAnnotationLayer={false} // Disable annotation layer to speed up rendering
        />
        {pageNumber > 1 && (
          <Page
            pageNumber={pageNumber - 1}
            width={window.innerWidth * 0.9}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="hidden" // Hide the preloaded page
          />
        )}
        {pageNumber < numPages && (
          <Page
            pageNumber={pageNumber + 1}
            width={window.innerWidth * 0.9}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="hidden" // Hide the preloaded page
          />
        )}
      </Document>
      <div className="page-controls" style={{ marginTop: "1rem" }}>
        <FaRegFilePdf size={30} />

        <input
          type="number"
          value={pageNumber}
          onChange={handlePageNumberChange}
          style={{ marginLeft: "0.5rem", width: "50px", textAlign: "center" }}
        />
        <span> / {numPages}</span>
      </div>
    </div>
  );
};

export default PDFViewer;
