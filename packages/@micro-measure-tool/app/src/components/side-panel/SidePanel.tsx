import ImageList from "./ImageList";
import MeasurementTree from "./MeasurementTree";

interface Props {
  highlightedImageId: string | null;
  onHighlightImage: (imageId: string | null) => void;
}

export default function SidePanel({ highlightedImageId, onHighlightImage }: Props) {
  return (
    <div className="w-64 border-l border-gray-800 bg-gray-900 p-3 flex flex-col gap-4 overflow-y-auto">
      <ImageList />
      <div className="border-t border-gray-800 pt-4">
        <MeasurementTree
          highlightedImageId={highlightedImageId}
          onHighlightImage={onHighlightImage}
        />
      </div>
    </div>
  );
}
