"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Cut off time. Child nodes older than this will be deleted.
const CUT_OFF_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * This database triggered function will check for child nodes that are older than the
 * cut-off time. Each child needs to have a `timestamp` attribute.
 */
exports.deleteOldOrders = functions.database
  .ref("/orders/{pushId}")
  .onCreate(async (change) => {

    const newAddedUserId = change.val().userId;
    const now = Date.now();
    const cutoff = now - CUT_OFF_TIME;
    console.log("Cut Off Timestamp: ", cutoff);
    const ref = change.ref.parent; // reference to the parent
    const oldItemQuery = ref.orderByChild("date").endAt(cutoff);
    const snapshot = await oldItemQuery.once("value");
    // create a map with all children that need to be removed
    const updates = {};
    snapshot.forEach((child) => {
      //remove only order with respective userId  
      if(child.val().userId === newAddedUserId){
        updates[child.key] = null;
      }
    });

    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });

