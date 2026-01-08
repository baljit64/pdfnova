interface Props {
  onFilesSelect: (files: File[]) => void;
}

export default function PDFUploader({ onFilesSelect }: Props) {
  return (
    <input
      type="file"
      accept="application/pdf"
      multiple
      onChange={(e) => {
        if (e.target.files) {
          onFilesSelect(Array.from(e.target.files));
        }
      }}
    />
  );
}
