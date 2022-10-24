import defaultSettings from "samepage/utils/defaultSettings";
import setupSamePageClient from "samepage/protocols/setupSamePageClient";
import runExtension from "roamjs-components/util/runExtension";
import { render as renderToast } from "roamjs-components/components/Toast";
import renderOverlay from "roamjs-components/util/renderOverlay";
import setupSharePageWithNotebook, {
  granularChanges,
} from "./messages/sharePageWithNotebook";
import loadSendPageToGraph from "./messages/sendPageToGraph";
import loadCopyBlockToGraph from "./messages/copyBlockToGraph";
import loadCrossGraphBlockReference from "./messages/crossGraphBlockReference";
import { OnloadArgs, Action } from "roamjs-components/types/native";
import React from "react";

const cacheSetting = ({
  extension,
  k,
  v,
}: Pick<OnloadArgs, "extension"> & { k: string; v: string }) => {
  // Roam in dev mode has a bug with settings persistence. cache in local storage
  if (extension.version === "DEV") {
    localStorage.setItem(`samepage:${window.roamAlphaAPI.graph.name}:${k}`, v);
  }
};

const setupUserSettings = async ({ extensionAPI, extension }: OnloadArgs) => {
  const fields = await Promise.all(
    defaultSettings.map(async (s) => {
      if (extension.version === "DEV") {
        const raw = localStorage.getItem(`samepage:${window.roamAlphaAPI.graph.name}:${s.id}`);
        if (typeof raw === "string") {
          const value = raw === "true" ? true : raw === "false" ? false : raw;
          await extensionAPI.settings.set(s.id, value);
        }
      }
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        action: (s.type === "boolean"
          ? {
              type: "switch" as const,
              onChange: (e) => {
                if (s.id === "granular-changes") {
                  granularChanges.enabled = e.target.checked;
                }
                cacheSetting({
                  extension,
                  k: s.id,
                  v: `${e.target.checked}`,
                });
              },
            }
          : s.type === "string"
          ? {
              type: "input",
              placeholder: s.default,
              onChange: (e) => {
                cacheSetting({ extension, k: s.id, v: e.target.value });
              },
            }
          : undefined) as Action,
      };
    })
  );
  extensionAPI.settings.panel.create({
    tabTitle: "SamePage",
    settings: [
      {
        id: "display-version",
        name: "Version",
        description: "The SamePage published version of this extension",
        action: {
          type: "reactComponent",
          component: () =>
            React.createElement(
              "span",
              {},
              process.env.VERSION || extension.version
            ),
        } as Action,
      },
    ].concat(fields.filter((s) => !!s.action)),
  });
  granularChanges.enabled = !!extensionAPI.settings.get("granular-changes");
};

const setupClient = ({ extensionAPI, extension }: OnloadArgs) =>
  setupSamePageClient({
    app: "Roam",
    workspace: window.roamAlphaAPI.graph.name,
    getSetting: (s) => (extensionAPI.settings.get(s) as string) || "",
    setSetting: (s, v) => {
      extensionAPI.settings.set(s, v);
      // Roam in dev mode has a bug with settings persistence. cache in local storage
      if (extension.version === "DEV") {
        localStorage.setItem(`samepage:${window.roamAlphaAPI.graph.name}:${s}`, v);
      }
    },
    addCommand: window.roamAlphaAPI.ui.commandPalette.addCommand,
    removeCommand: window.roamAlphaAPI.ui.commandPalette.removeCommand,
    renderOverlay,
    onAppLog: (evt) =>
      evt.intent !== "debug" &&
      renderToast({
        id: evt.id,
        content: evt.content,
        intent:
          evt.intent === "error"
            ? "danger"
            : evt.intent === "info"
            ? "primary"
            : evt.intent,
      }),
  });

const setupProtocols = (api: typeof window.samepage) => {
  const unloadSharePageWithNotebook = setupSharePageWithNotebook();
  const unloadCopyBlockToGraph = loadCopyBlockToGraph(api);
  const unloadCrossGraphBlockReference = loadCrossGraphBlockReference(api);
  const unloadSendPageToGraph = loadSendPageToGraph(api);
  return () => {
    unloadSharePageWithNotebook();
    unloadCopyBlockToGraph();
    unloadCrossGraphBlockReference();
    unloadSendPageToGraph();
  };
};

export default runExtension({
  run: async (args) => {
    await setupUserSettings(args);
    const { unload: unloadSamePageClient, ...api } = setupClient(args);
    const unloadProtocols = setupProtocols(api);
    return () => {
      unloadProtocols();
      unloadSamePageClient();
    };
  },
});
