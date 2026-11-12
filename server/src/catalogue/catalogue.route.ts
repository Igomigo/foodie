import { Router } from "express";
import { catalogueController } from "./catalogue.controller";

export const catalogueRouter = Router();
catalogueRouter.get("/food-categories", (req, res) =>
  catalogueController.categories(req, res),
);
catalogueRouter.get("/vendors", (req, res) =>
  catalogueController.vendors(req, res),
);
catalogueRouter.get("/vendors/:id", (req, res) =>
  catalogueController.vendor(req, res),
);
catalogueRouter.get("/vendors/:id/menu", (req, res) =>
  catalogueController.menu(req, res),
);
catalogueRouter.get("/menu-items", (req, res) =>
  catalogueController.menuItems(req, res),
);
catalogueRouter.get("/menu-items/:id", (req, res) =>
  catalogueController.menuItem(req, res),
);
