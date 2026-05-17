import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import TourExtrasFormSection from "../../../components/tours/TourExtrasFormSection";
import MultiTourImagePicker from "../../../components/tours/MultiTourImagePicker";
import { defaultTourExtras, serializeTourExtras } from "../../../Services/utils/tourJsonUtils";
import { createTour } from "../../../Services/api/tours";

const createInitialState = () => ({
  title: "",
  description: "",
  price: "",
  durationHours: "",
  maxGroupSize: "",
  ...defaultTourExtras(),
  imageFiles: [],
  existingImageUrls: [],
});

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export default function CreateTourModal({ isOpen, onClose, onTourCreated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(createInitialState());
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (imageFiles, existingImageUrls) => {
    setForm((prev) => ({
      ...prev,
      imageFiles,
      existingImageUrls: existingImageUrls || prev.existingImageUrls || [],
    }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.title || !form.description || !form.price || !form.durationHours || !form.maxGroupSize) {
        toast.error("Please fill all required fields");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;

    setIsLoading(true);
    try {
      const { programStops, inclusionLines, addOnRows, ...rest } = form;
      const extras = serializeTourExtras({
        programStops,
        inclusionLines,
        addOnRows,
      });
      await createTour({ ...rest, ...extras });
      toast.success("Tour created successfully!");
      setForm(createInitialState());
      setCurrentStep(1);
      onClose();
      onTourCreated?.();
    } catch (err) {
      const body = err.response?.data;
      const errors = body?.errors;
      toast.error(
        body?.message ||
          (errors && Object.values(errors).flat().join(" ")) ||
          "Failed to create tour"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm(createInitialState());
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-egypt-teal to-teal-600 px-6 py-4 flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">Create New Tour</h2>
              <p className="text-sm text-white/80 mt-1">Step {currentStep} of 4</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 flex">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 transition-colors ${
                  step <= currentStep ? "bg-egypt-teal" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tour Title *
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                        placeholder="e.g., Luxor 3-Day Adventure"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none min-h-[100px] resize-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                        placeholder="Describe your tour experience..."
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price (EGP) *
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                          placeholder="0"
                          value={form.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Duration (Hours) *
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                          placeholder="0"
                          value={form.durationHours}
                          onChange={(e) => handleChange("durationHours", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Max Group Size *
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                          placeholder="0"
                          value={form.maxGroupSize}
                          onChange={(e) => handleChange("maxGroupSize", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Program */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tour Program</h3>
                    <TourExtrasFormSection
                      programStops={form.programStops}
                      onChangeProgramStops={(programStops) =>
                        setForm((prev) => ({ ...prev, programStops }))
                      }
                      inclusionLines={form.inclusionLines}
                      onChangeInclusionLines={(inclusionLines) =>
                        setForm((prev) => ({ ...prev, inclusionLines }))
                      }
                      addOnRows={form.addOnRows}
                      onChangeAddOnRows={(addOnRows) =>
                        setForm((prev) => ({ ...prev, addOnRows }))
                      }
                    />
                  </div>
                )}

                {/* Step 3: Includes & Add-ons */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                      <TourExtrasFormSection
                        programStops={form.programStops}
                        onChangeProgramStops={(programStops) =>
                          setForm((prev) => ({ ...prev, programStops }))
                        }
                        inclusionLines={form.inclusionLines}
                        onChangeInclusionLines={(inclusionLines) =>
                          setForm((prev) => ({ ...prev, inclusionLines }))
                        }
                        addOnRows={form.addOnRows}
                        onChangeAddOnRows={(addOnRows) =>
                          setForm((prev) => ({ ...prev, addOnRows }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Images */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tour Images</h3>
                    <MultiTourImagePicker
                      files={form.imageFiles}
                      existingImageUrls={form.existingImageUrls || []}
                      onChange={handleImageChange}
                      label="Upload tour images"
                      hint="Choose multiple high-quality images"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <div className="flex gap-3">
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 transition"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {isLoading ? "Creating..." : "Create Tour"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
