import { mapKeys, omit } from "lodash";
import {
    ADD_VIDEO,
    ADD_VIDEOS,
    REMOVE_VIDEO,
    REMOVE_ALL_VIDEOS,
    VIDEO_PROGRESS,
    VIDEO_COMPLETE
} from "../actions/types";

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case VIDEO_COMPLETE:
            return { ...state, [action.payload.path]: { ...action.payload, complete: true } };
        case VIDEO_PROGRESS:
            return { ...state, [action.payload.path]: action.payload };
        case ADD_VIDEOS:
            return { ...state, ...mapKeys(action.payload, "path")};
        case ADD_VIDEO:
            return { ...state, [action.payload.path]: action.payload };
        case REMOVE_VIDEO:
            return omit(state, action.payload.path);
        case REMOVE_ALL_VIDEOS:
            return INITIAL_STATE
        default:
            return state
    }
}
