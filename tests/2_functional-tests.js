const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
   let defaultUrl = "/api/issues/apitest";
   let defaultId;
   /* Post Method */
   suite("Post Method", () => {
      test("Create an issue with every field", (done) => {
         chai
            .request(server)
            .post(defaultUrl)
            .type("form")
            .send({
               issue_title: "khanh title",
               issue_text: "khanh text",
               created_by: "khanhvtn",
               assigned_to: "assgined to khanh",
               status_text: "ok",
            })
            .end((err, res) => {
               const data = res.body;
               const { updated_on, created_on, _id, ...resObj } = res.body;
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.hasAllKeys(data, [
                  "_id",
                  "issue_title",
                  "issue_text",
                  "created_on",
                  "updated_on",
                  "created_by",
                  "assigned_to",
                  "open",
                  "status_text",
               ]);
               assert.deepEqual(resObj, {
                  assigned_to: "assgined to khanh",
                  status_text: "ok",
                  open: true,
                  issue_title: "khanh title",
                  issue_text: "khanh text",
                  created_by: "khanhvtn",
               });
               defaultId = _id;
               done();
            });
      });

      test("Create an issue with only required fields", (done) => {
         chai
            .request(server)
            .post(defaultUrl)
            .type("form")
            .send({
               issue_title: "khanh title",
               issue_text: "khanh text",
               created_by: "khanhvtn",
               assigned_to: "",
               status_text: "",
            })
            .end((err, res) => {
               const data = res.body;
               const { updated_on, created_on, _id, ...resObj } = res.body;
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.hasAllKeys(data, [
                  "_id",
                  "issue_title",
                  "issue_text",
                  "created_on",
                  "updated_on",
                  "created_by",
                  "assigned_to",
                  "open",
                  "status_text",
               ]);
               assert.deepEqual(resObj, {
                  assigned_to: "",
                  status_text: "",
                  open: true,
                  issue_title: "khanh title",
                  issue_text: "khanh text",
                  created_by: "khanhvtn",
               });
               done();
            });
      });
      test("Create an issue with missing required fields", (done) => {
         chai
            .request(server)
            .post(defaultUrl)
            .type("form")
            .send({
               issue_title: "khanh title",
            })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  error: "required field(s) missing",
               });
               done();
            });
      });
   });
   /* Get Method */
   suite("Get Method", () => {
      test("View issues on a project", (done) => {
         chai
            .request(server)
            .get(defaultUrl)
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.isArray(res.body);
               done();
            });
      });
      test("View issues on a project with one filter", (done) => {
         chai
            .request(server)
            .get("/api/issues/apitest?open=true")
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.isArray(res.body);
               done();
            });
      });
      test("View issues on a project with multiple filters", (done) => {
         chai
            .request(server)
            .get("/api/issues/apitest?open=true&assigned_to=khanhvtn")
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.isArray(res.body);
               done();
            });
      });
   });
   /* Put Method */
   suite("Put Method", () => {
      test("Update one field on an issue", (done) => {
         chai
            .request(server)
            .put(defaultUrl)
            .send({
               _id: defaultId,
               issue_title: "khanhvtn update",
            })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  result: "successfully updated",
                  _id: defaultId,
               });
               done();
            });
      });
      test("Update multiple fields on an issue", (done) => {
         chai
            .request(server)
            .put(defaultUrl)
            .send({
               _id: defaultId,
               issue_title: "khanhvtn update",
               issue_text: "khanhvtn update",
               created_by: "khanhvtn",
               assigned_to: "khanhvtn",
               status_text: "khanhvtn status text",
               open: false,
            })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  result: "successfully updated",
                  _id: defaultId,
               });
               done();
            });
      });
      test("Update an issue with missing _id", (done) => {
         chai
            .request(server)
            .put(defaultUrl)
            .send({
               issue_title: "khanhvtn update",
            })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  error: "missing _id",
               });
               done();
            });
      });
      test("Update an issue with no fields to update", (done) => {
         chai
            .request(server)
            .put(defaultUrl)
            .send({
               _id: defaultId,
            })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  error: "no update field(s) sent",
                  _id: defaultId,
               });
               done();
            });
      });
      test("Update an issue with an invalid _id", (done) => {
         chai
            .request(server)
            .put(defaultUrl)
            .send({
               _id: "123",
            })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  error: "could not update",
                  _id: "123",
               });
               done();
            });
      });
   });

   /* Delete Method */
   suite("Delete Method", () => {
      test("Delete an issue", (done) => {
         chai
            .request(server)
            .delete(defaultUrl)
            .send({ _id: defaultId })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  result: "successfully deleted",
                  _id: defaultId,
               });
               done();
            });
      });
      test("Delete an issue with an invalid _id", (done) => {
         chai
            .request(server)
            .delete(defaultUrl)
            .send({ _id: "123" })
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  error: "could not delete",
                  _id: "123",
               });
               done();
            });
      });
      test("Delete an issue with missing _id", (done) => {
         chai
            .request(server)
            .delete(defaultUrl)
            .end((err, res) => {
               assert.equal(res.status, 200);
               assert.equal(res.type, "application/json");
               assert.deepEqual(res.body, {
                  error: "missing _id",
               });
               done();
            });
      });
   });
});
