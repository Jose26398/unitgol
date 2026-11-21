import { X } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { ACHIEVEMENTS } from "../utils/achievements";

interface AchievementsInfoModalProps {
  onClose: () => void;
}

export function AchievementsInfoModal({ onClose }: AchievementsInfoModalProps) {
  return (
    <Dialog title="Logros disponibles" onClose={onClose}>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 transition-colors hover:text-gray-800"
          aria-label="Cerrar explicación de logros"
          title="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {ACHIEVEMENTS.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-start gap-3 rounded-md border border-gray-300 hover:bg-gray-100 p-3"
          >
            <span className="text-2xl" aria-hidden="true">
              {achievement.emoji}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded-sm hover:bg-red-600 transition-colors"
          aria-label="Cerrar modal"
        >
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
