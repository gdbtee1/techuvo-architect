import { useEffect } from "react";
import { useArchitectStore } from "../store/useArchitectStore";

export function useCadKeyboard() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          target?.tagName ?? ""
        )
      ) {
        return;
      }

      const store = useArchitectStore.getState();
      const command = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (command && key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }

        return;
      }

      if (command && key === "y") {
        event.preventDefault();
        store.redo();
        return;
      }

      if (
        !command &&
        !event.altKey &&
        (event.key === "Delete" ||
          event.key === "Backspace")
      ) {
        if (store.selectedWallId) {
          event.preventDefault();
          store.deleteSelectedWall();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);
}
