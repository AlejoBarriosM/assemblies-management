SELECT
  ROW_NUMBER() OVER (
    ORDER BY
      c.name,
      gs.name,
      gc.name
  ) AS ID,
  c.id AS countryId,
  c.name AS countryName,
  gs.id AS stateId,
  gs.name AS stateName,
  gc.id AS cityId,
  gc.name AS cityName
FROM
  grl_countries AS c
  JOIN dbo.grl_states AS gs ON c.id = gs.country_id
  JOIN dbo.grl_cities AS gc ON gs.id = gc.state_id;