import React, { useCallback, useMemo, useState } from "react";
import { Button, Checkbox, Classes, Dialog, Intent } from "@blueprintjs/core";

const GraphMessageAlert = ({
  onClose,
  children,
  disabled = false,
  onSubmitToGraph,
  title,
  allGraphs,
}: {
  onClose: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  onSubmitToGraph: (graph: string) => Promise<void>;
  title: string;
  allGraphs: string[];
}) => {
  const [graphs, setGraphs] = useState(new Set<string>());
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(() => {
    setLoading(true);
    Promise.all(Array.from(graphs).map(onSubmitToGraph))
      .then(onClose)
      .catch(() => setLoading(false));
  }, [onSubmitToGraph, onClose, graphs]);
  const submitDisabled = useMemo(
    () => disabled || !graphs.size,
    [disabled, graphs.size]
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !submitDisabled
      ) {
        onSubmit();
      }
      e.stopPropagation();
    },
    [onSubmit, submitDisabled]
  );
  return (
    <>
      <Dialog
        isOpen={true}
        title={title}
        onClose={onClose}
        canOutsideClickClose
        canEscapeKeyClose
        autoFocus={false}
      >
        <div className={Classes.DIALOG_BODY} onKeyDown={onKeyDown}>
          {allGraphs.length > 0
            ? children
            : `There are no graphs available to send.`}
          {allGraphs.length > 1 && (
            <Checkbox
              labelElement={<b>Select All</b>}
              checked={graphs.size >= allGraphs.length}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).checked;
                if (val) {
                  setGraphs(new Set(allGraphs));
                } else {
                  setGraphs(new Set());
                }
              }}
            />
          )}
          {allGraphs.map((g) => (
            <Checkbox
              label={g}
              key={g}
              checked={graphs.has(g)}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).checked;
                if (val) {
                  graphs.add(g);
                } else {
                  graphs.delete(g);
                }
                setGraphs(new Set(graphs));
              }}
            />
          ))}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text={"Cancel"} onClick={onClose} disabled={loading} />
            <Button
              text={"Send"}
              intent={Intent.PRIMARY}
              onClick={onSubmit}
              disabled={submitDisabled || loading}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default GraphMessageAlert;
