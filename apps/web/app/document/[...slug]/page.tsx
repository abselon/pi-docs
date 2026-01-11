// Server component wrapper for static export with catch-all routes
import DocumentPreviewClient from './DocumentPreviewClient';

// Required for static export with catch-all routes
// For static export, Next.js requires all routes to be pre-generated.
// Since document IDs are dynamic, we generate placeholder routes.
// The client component handles all routing by reading the document ID from the URL.
export function generateStaticParams() {
  // Generate placeholder routes to satisfy static export requirements
  // In production build, only these routes will be generated.
  // The client component reads the actual document ID from window.location.pathname
  return [
    { slug: ['index'] },
    // Add more placeholders to increase the chance of matching
    { slug: ['placeholder'] },
  ];
}

export default function DocumentPreviewPage() {
  return <DocumentPreviewClient />;
}
