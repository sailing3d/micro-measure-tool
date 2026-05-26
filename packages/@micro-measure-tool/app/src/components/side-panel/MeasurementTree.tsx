import { useImagesStore } from "../../stores/imagesStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";

interface Props {
  highlightedImageId: string | null;
  onHighlightImage: (imageId: string | null) => void;
}

export default function MeasurementTree({ highlightedImageId, onHighlightImage }: Props) {
  const images = useImagesStore((s) => s.images);
  const measurements = useMeasurementsStore((s) => s.measurements);
  const removeMeasurement = useMeasurementsStore((s) => s.removeMeasurement);

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        测量结果
      </h3>
      {measurements.length === 0 && (
        <p className="text-xs text-gray-600">暂无测量</p>
      )}
      {images.map((img) => {
        const imgMeasurements = measurements.filter(
          (m) => m.imageId === img.id,
        );
        if (imgMeasurements.length === 0) return null;
        return (
          <div key={img.id} className="mb-2">
            <div
              className={`text-xs font-medium truncate mb-1 cursor-pointer rounded px-1 py-0.5 ${
                highlightedImageId === img.id
                  ? "text-amber-300 bg-amber-500/10"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => onHighlightImage(img.id)}
              onMouseLeave={() => onHighlightImage(null)}
              onClick={() => onHighlightImage(highlightedImageId === img.id ? null : img.id)}
            >
              <span className="text-gray-500 mr-1">#{img.label}</span>
              {img.filename}
            </div>
            {imgMeasurements.map((m) => (
              <div
                key={m.id}
                onMouseEnter={() => onHighlightImage(img.id)}
                onMouseLeave={() => onHighlightImage(null)}
                onClick={() => onHighlightImage(highlightedImageId === img.id ? null : img.id)}
                className={`group flex items-center justify-between rounded px-2 py-0.5 text-xs cursor-pointer ${
                  highlightedImageId === img.id
                    ? "text-amber-300 bg-amber-500/10"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <span>
                  <span className="text-gray-500">{m.name}</span>
                  <span className="ml-1 text-gray-300">
                    {m.type === "h-line" && "lengthUm" in m.data
                      ? `${m.data.lengthUm.toFixed(2)} µm`
                      : m.type === "constrained-circle" && "diameterUm" in m.data
                      ? `${m.data.diameterUm.toFixed(2)} µm (直径)`
                      : ""}
                  </span>
                </span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                  onClick={(e) => { e.stopPropagation(); removeMeasurement(m.id); }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
