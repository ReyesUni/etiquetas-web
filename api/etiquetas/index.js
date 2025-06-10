const { CosmosClient } = require("@azure/cosmos");

const endpoint  = process.env.COSMOS_ENDPOINT;
const key       = process.env.COSMOS_KEY;
const dbName    = process.env.COSMOS_DB_NAME || "etiquetasDB";
const container = process.env.COSMOS_CONTAINER || "etiquetas";

const client = new CosmosClient({ endpoint, key });
const cont   = client.database(dbName).container(container);

module.exports = async function (context, req) {
  const m = req.method.toUpperCase();

  try {
    if (m === "GET") {
      const { resources } = await cont.items.readAll().fetchAll();
      context.res = { jsonBody: resources };
    } else if (m === "POST") {
      const data = req.body;
      if (!data?.articulo) return context.res = { status: 400, body: "Falta 'articulo'" };
      data.id = data.articulo;
      data.estado = "Pendiente";
      const { resource } = await cont.items.create(data);
      context.res = { status: 201, jsonBody: resource };
    } else if (m === "PUT") {
      const { id } = req.body || {};
      if (!id) return context.res = { status: 400, body: "Falta 'id'" };
      const { resource } = await cont.item(id, id).replace(req.body);
      context.res = { jsonBody: resource };
    } else {
      context.res = { status: 405, body: "Método no permitido" };
    }
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: e.message };
  }
};
