import { useImagesStore } from "../../stores/imagesStore";
import { useMeasurementsStore } from "../../stores/measurementsStore";

export default function MeasurementTree() {
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
            <div className="text-xs font-medium text-gray-300 truncate mb-1">
              {img.filename}
            </div>
            {imgMeasurements.map((m) => {
              let value = "";
              if (m.type === "h-line" && "lengthUm" in m.data) {
                value = `${m.data.lengthUm.toFixed(2)} µm`;
              } else if (
                m.type === "constrained-circle" &&
                "diameterUm" in m.data
              ) {
                value = `${m.data.diameterUm.toFixed(2)} µm (直径)`;
              }
              return (
                <div
                  key={m.id}
                  className="group flex items-center justify-between rounded px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-800"
                >
                  <span>
                    <span className="text-gray-500">{m.name}</span>
                    <span className="ml-1 text-gray-300">{value}</span>
                  </span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                    onClick={() => removeMeasurement(m.id)}
                  >
                    删除
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
