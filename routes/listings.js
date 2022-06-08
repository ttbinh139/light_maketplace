/*
 * All routes for Listings are defined here
 * Since this file is loaded in server.js into api/listings,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    const queryParams = []
    let queryString = `SELECT * FROM listings JOIN photos ON listings.id = listing_id `


    if (req.query.buying) {
      queryParams.push(`%${req.query.buying}%`);
      queryString += `WHERE title LIKE $${queryParams.length};`;
    }

    if (req.query.min) {
      queryParams.push(req.query.min);
      queryString += `AND price >= $${queryParams.length} `;
    }

    if (req.query.max) {
      queryParams.push(req.query.max);
      queryString += `AND price <= $${queryParams.length} `;
    }


    db.query(queryString, queryParams)
      .then((data) => {
        const templateVars = {
          "listings": data.rows,
        };
        const listings = data.rows;
        //res.json({ listings });
        res.render("listings", templateVars)
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get("/:id", (req,res) => {
    db.query(`SELECT *
      FROM listings JOIN photos ON listings.id = listing_id
      WHERE listings.id = 1;`)
      .then((data) => {
        const templateVars = {
          "listings": data.rows,
        };
        const listings = data.rows;
        //res.json({ listings})
        res.render("listingid", templateVars)
      })
  })

  return router
}
