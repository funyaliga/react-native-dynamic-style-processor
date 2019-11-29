import { transform as transformViewportUnit } from "css-viewport-units-transform";
import { transform as transformPx2dpUnit } from "./css-px2dp-units-transform";
import memoize from "micro-memoize";
import { Dimensions } from "react-native";
import { process as mediaQueriesProcess } from "react-native-css-media-query-processor";

function omit(obj, omitKey) {
  return Object.keys(obj).reduce((result, key) => {
    if (key !== omitKey) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

const omitMemoized = memoize(omit);

function viewportUnitsTransform(obj, matchObject) {
  const hasViewportUnits = "__viewportUnits" in obj;

  if (!hasViewportUnits) {
    return obj;
  }
  return transformViewportUnit(
    omitMemoized(obj, "__viewportUnits"),
    matchObject
  );
}

function px2dpUnitsTransform(obj, matchObject) {
  // const hasPx2dpUnits = "__px2dpUnits" in obj;
  // if (!hasPx2dpUnits) {
  //   return obj;
  // }
  return transformPx2dpUnit(omitMemoized(obj, "__px2dpUnits"), matchObject);
}

function mediaQueriesTransform(obj, matchObject) {
  const hasParsedMQs = "__mediaQueries" in obj;

  if (!hasParsedMQs) {
    return obj;
  }
  return mediaQueriesProcess(obj, matchObject);
}

export function process(obj) {
  const matchObject = getMatchObject();
  return px2dpUnitsTransform(
    viewportUnitsTransform(
      mediaQueriesTransform(obj, matchObject),
      matchObject
    ),
    matchObject
  );
}

function getMatchObject() {
  const win = Dimensions.get("window");
  return {
    width: win.width,
    height: win.height,
    orientation: win.width > win.height ? "landscape" : "portrait",
    "aspect-ratio": win.width / win.height,
    designWidth: 750,
    type: "screen"
  };
}
