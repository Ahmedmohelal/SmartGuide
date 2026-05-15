import { MapPinned, MinusCircle, Package, PlusCircle, Sparkles } from "lucide-react";

export default function TourExtrasFormSection({
  programStops,
  onChangeProgramStops,
  inclusionLines,
  onChangeInclusionLines,
  addOnRows,
  onChangeAddOnRows,
}) {
  const updateStop = (index, key, value) => {
    const next = programStops.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    onChangeProgramStops(next);
  };

  const addStop = () => {
    onChangeProgramStops([
      ...programStops,
      { title: "", description: "" },
    ]);
  };

  const removeStop = (index) => {
    if (programStops.length <= 1) {
      onChangeProgramStops([{ title: "", description: "" }]);
      return;
    }
    onChangeProgramStops(programStops.filter((_, i) => i !== index));
  };

  const updateInclusion = (index, value) => {
    const next = inclusionLines.map((line, i) => (i === index ? value : line));
    onChangeInclusionLines(next);
  };

  const addInclusion = () => {
    onChangeInclusionLines([...inclusionLines, ""]);
  };

  const removeInclusion = (index) => {
    if (inclusionLines.length <= 1) {
      onChangeInclusionLines([""]);
      return;
    }
    onChangeInclusionLines(inclusionLines.filter((_, i) => i !== index));
  };

  const updateAddOn = (index, key, value) => {
    const next = addOnRows.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    onChangeAddOnRows(next);
  };

  const addAddOn = () => {
    onChangeAddOnRows([...addOnRows, { title: "", price: "" }]);
  };

  const removeAddOn = (index) => {
    if (addOnRows.length <= 1) {
      onChangeAddOnRows([{ title: "", price: "" }]);
      return;
    }
    onChangeAddOnRows(addOnRows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 md:p-5">
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
          <MapPinned size={18} className="text-egypt-teal shrink-0" />
          Program (stops)
        </h4>
        <p className="mb-3 text-xs text-gray-500">
          Numbered on the tour page: title and short description per stop.
        </p>
        <div className="space-y-3">
          {programStops.map((row, index) => (
            <div
              key={`stop-${index}`}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  Stop {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStop(index)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <MinusCircle size={14} />
                  Remove
                </button>
              </div>
              <input
                className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-egypt-teal focus:ring-2 focus:ring-egypt-teal/20"
                placeholder="Stop title (e.g. Qaitbay Citadel)"
                value={row.title}
                onChange={(e) => updateStop(index, "title", e.target.value)}
              />
              <textarea
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-egypt-teal focus:ring-2 focus:ring-egypt-teal/20"
                rows={2}
                placeholder="Short description"
                value={row.description}
                onChange={(e) =>
                  updateStop(index, "description", e.target.value)
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addStop}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-egypt-teal/50 bg-white px-3 py-2 text-sm font-semibold text-egypt-teal hover:bg-teal-50/80"
          >
            <PlusCircle size={16} />
            Add stop
          </button>
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
          <Package size={18} className="text-egypt-teal shrink-0" />
          Included
        </h4>
        <p className="mb-3 text-xs text-gray-500">
          One line per item (e.g. Lunch included, Tickets).
        </p>
        <div className="space-y-2">
          {inclusionLines.map((line, index) => (
            <div key={`inc-${index}`} className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-egypt-teal focus:ring-2 focus:ring-egypt-teal/20"
                placeholder="What's included"
                value={line}
                onChange={(e) => updateInclusion(index, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeInclusion(index)}
                className="shrink-0 rounded-lg border border-gray-200 px-2 text-red-600 hover:bg-red-50"
                aria-label="Remove line"
              >
                <MinusCircle size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInclusion}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-egypt-teal/50 bg-white px-3 py-2 text-sm font-semibold text-egypt-teal hover:bg-teal-50/80"
          >
            <PlusCircle size={16} />
            Add line
          </button>
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
          <Sparkles size={18} className="text-egypt-teal shrink-0" />
          Add-ons
        </h4>
        <p className="mb-3 text-xs text-gray-500">
          Optional extras with extra price (EGP).
        </p>
        <div className="space-y-3">
          {addOnRows.map((row, index) => (
            <div
              key={`addon-${index}`}
              className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-nowrap"
            >
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs text-gray-500">Name</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-egypt-teal focus:ring-2 focus:ring-egypt-teal/20"
                  placeholder="e.g. Private guide"
                  value={row.title}
                  onChange={(e) =>
                    updateAddOn(index, "title", e.target.value)
                  }
                />
              </div>
              <div className="w-full sm:w-28">
                <label className="mb-1 block text-xs text-gray-500">
                  + Price
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-egypt-teal focus:ring-2 focus:ring-egypt-teal/20"
                  placeholder="0"
                  value={row.price}
                  onChange={(e) =>
                    updateAddOn(index, "price", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeAddOn(index)}
                className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50 sm:mb-0.5"
                aria-label="Remove add-on"
              >
                <MinusCircle size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAddOn}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-egypt-teal/50 bg-white px-3 py-2 text-sm font-semibold text-egypt-teal hover:bg-teal-50/80"
          >
            <PlusCircle size={16} />
            Add add-on
          </button>
        </div>
      </div>
    </div>
  );
}
