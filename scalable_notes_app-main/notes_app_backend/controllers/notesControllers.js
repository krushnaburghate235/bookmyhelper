import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import dynamoClient from "../config/dynamo.js";

import { randomUUID } from "crypto";

// Create new note

export const createNote = async (req, res) => {
  try {
    const { note, isPublic = false } = req.body;
    const { clientId } = req.user;

    console.log(req.body);
    console.log(req.user);

    const noteId = randomUUID();
    const currentTime = new Date().toISOString();
    const shareUrl = isPublic
      ? `${process.env.FRONTEND_URL}/shared/${noteId}`
      : null;

    const noteItem = {
      clientId,
      noteId,
      note,
      savedTime: currentTime,
      lastUpdated: currentTime,
      isPublic,
      shareUrl,
    };

    const command = new PutCommand({
      TableName: "user_notes",
      Item: noteItem,
    });

    await dynamoClient.send(command);
    console.log("Note got created");
    res.status(201).json({
      message: "Note created successfully",
      note: noteItem,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

// read all notes created by the current user

export const getNotes = async (req, res) => {
  try {
    const { clientId } = req.user;

    console.log(req.user);

    // Pagination params: limit and nextKey (base64-encoded LastEvaluatedKey)
    const limit = Math.max(
      1,
      Math.min(parseInt(req.query.limit || "12", 10), 50)
    );
    let exclusiveStartKey = undefined;
    if (req.query.nextKey) {
      try {
        const decoded = Buffer.from(req.query.nextKey, "base64").toString(
          "utf8"
        );
        exclusiveStartKey = JSON.parse(decoded);
      } catch (e) {
        return res.status(400).json({ error: "Invalid nextKey" });
      }
    }

    const command = new QueryCommand({
      TableName: "user_notes",
      IndexName: "clientId-lastUpdated-index",
      KeyConditionExpression: "clientId = :clientId",
      ExpressionAttributeValues: {
        ":clientId": clientId,
      },
      ScanIndexForward: false, // newest first
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey,
    });

    const result = await dynamoClient.send(command);

    const response = {
      notes: result.Items || [],
      nextKey: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
            "base64"
          )
        : null,
      count: (result.Items || []).length,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// for updating the note
export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note, isPublic } = req.body;

    const currentTime = new Date().toISOString();
    const shareUrl = isPublic
      ? `${process.env.FRONTEND_URL}/shared/${noteId}`
      : null;

    const command = new UpdateCommand({
      TableName: "user_notes",
      Key: {
        noteId,
      },
      UpdateExpression:
        "SET note = :note, lastUpdated = :lastUpdated, isPublic = :isPublic, shareUrl = :shareUrl",
      ExpressionAttributeValues: {
        ":note": note,
        ":lastUpdated": currentTime,
        ":isPublic": isPublic || false,
        ":shareUrl": shareUrl,
      },
      ReturnValues: "ALL_NEW",
    });

    const result = await dynamoClient.send(command);

    res.json({
      message: "Note updated successfully",
      note: result.Attributes,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

// for deleting the note

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const command = new DeleteCommand({
      TableName: "user_notes",
      Key: {
        noteId,
      },
    });

    await dynamoClient.send(command);

    res.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

// to read our sharable note
export const getSharedNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const command = new QueryCommand({
      TableName: "user_notes",

      KeyConditionExpression: "noteId = :noteId",
      FilterExpression: "isPublic = :isPublic",
      ExpressionAttributeValues: {
        ":noteId": noteId,
        ":isPublic": true,
      },
    });

    const result = await dynamoClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return res
        .status(404)
        .json({ error: "Shared note not found or not public" });
    }

    res.json({
      note: result.Items[0],
    });
  } catch (error) {
    console.error("Error fetching shared note:", error);
    res.status(500).json({ error: "Failed to fetch shared note" });
  }
};
