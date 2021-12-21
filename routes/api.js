"use strict";
const { ObjectId } = require("mongodb");
module.exports = function (app, db) {
   app.route("/api/issues/:project")
      .get(async function (req, res) {
         let project = req.params.project;
         const {
            assigned_to,
            status_text,
            open,
            _id,
            issue_title,
            issue_text,
            created_by,
         } = req.query;

         try {
            const collection = await db.collection(project);
            let defaultFilter = {};
            if (assigned_to) {
               defaultFilter = { ...defaultFilter, assigned_to };
            }
            if (status_text) {
               defaultFilter = { ...defaultFilter, status_text };
            }
            if (open) {
               defaultFilter = {
                  ...defaultFilter,
                  open: open === "true" ? true : false,
               };
            }
            if (_id) {
               defaultFilter = { ...defaultFilter, _id };
            }
            if (issue_title) {
               defaultFilter = { ...defaultFilter, issue_title };
            }
            if (issue_text) {
               defaultFilter = { ...defaultFilter, issue_text };
            }
            if (created_by) {
               defaultFilter = { ...defaultFilter, created_by };
            }
            const result = await collection.find(defaultFilter).toArray();
            return res.json(result);
         } catch (error) {
            return res.json({ error: error.message });
         }
      })

      .post(async function (req, res) {
         let project = req.params.project;
         const {
            assigned_to,
            status_text,
            issue_title,
            issue_text,
            created_by,
         } = req.body;

         if (!issue_title || !issue_text || !created_by) {
            return res.json({ error: "required field(s) missing" });
         }
         try {
            const collection = await db.collection(project);
            const result = await collection.insertOne({
               issue_title,
               issue_text,
               created_by,
               assigned_to: assigned_to ? assigned_to : "",
               status_text: status_text ? status_text : "",
               open: true,
               created_on: new Date(),
               updated_on: new Date(),
            });
            const newIssue = await collection.findOne({
               _id: result.insertedId,
            });
            return res.json({ ...newIssue, _id: newIssue._id.toString() });
         } catch (error) {
            return res.json({ error: error.message });
         }
      })

      .put(async function (req, res) {
         let project = req.params.project;
         const {
            _id,
            assigned_to,
            status_text,
            issue_title,
            issue_text,
            created_by,
            open,
         } = req.body;
         let updateFields = {};
         if (!_id) {
            return res.json({
               error: "missing _id",
            });
         }
         if (!ObjectId.isValid(_id)) {
            return res.json({ error: "could not update", _id });
         }
         if (
            !assigned_to &&
            !status_text &&
            !issue_title &&
            !issue_text &&
            !created_by &&
            !open
         ) {
            return res.json({ _id, error: "no update field(s) sent" });
         }

         if (assigned_to) {
            updateFields = { ...updateFields, assigned_to };
         }
         if (status_text) {
            updateFields = { ...updateFields, status_text };
         }
         if (issue_title) {
            updateFields = { ...updateFields, issue_title };
         }
         if (issue_text) {
            updateFields = { ...updateFields, issue_text };
         }
         if (created_by) {
            updateFields = { ...updateFields, created_by };
         }
         if (open) {
            updateFields = {
               ...updateFields,
               open: open === "true" ? true : false,
            };
         }

         try {
            const collection = await db.collection(project);
            const { value } = await collection.findOneAndUpdate(
               { _id: new ObjectId(_id) },
               {
                  $set: { ...updateFields, updated_on: new Date() },
               },
               { returnNewDocument: true }
            );
            return res.json({
               result: "successfully updated",
               _id: value._id.toString(),
            });
         } catch (error) {
            return res.json({ error: error.message });
         }
      })

      .delete(async function (req, res) {
         let project = req.params.project;
         const { _id } = req.body;
         try {
            const collection = await db.collection(project);
            if (!_id) {
               return res.json({
                  error: "missing _id",
               });
            }
            if (!ObjectId.isValid(_id)) {
               return res.json({
                  error: "could not delete",
                  _id,
               });
            }
            const { value } = await collection.findOneAndDelete({
               _id: new ObjectId(_id),
            });
            return res.json({
               result: "successfully deleted",
               _id: value._id.toString(),
            });
         } catch (error) {
            return res.json({ error: error.message });
         }
      });
};
