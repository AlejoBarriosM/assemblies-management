WITH LocationParts AS (
  SELECT
    l.id AS location_id,
    co.name AS countryName_val,
    s.name AS stateName_val,
    ci.name AS cityName_val,
    NULLIF(
      CONCAT_WS(
        ' ',
        rt1.name,
        CAST(l.street_1 AS VARCHAR(255)),
        l.streetLetter_1,
        l.streetCom_1
      ),
      ''
    ) AS P1,
    NULLIF(
      CONCAT_WS(
        ' ',
        rt2.name,
        CAST(l.street_2 AS VARCHAR(255)),
        l.streetLetter_2
      ),
      ''
    ) AS P2,
    NULLIF(LTRIM(RTRIM(l.streetCom_2)), '') AS P3,
    NULLIF(LTRIM(RTRIM(l.complement)), '') AS P4
  FROM
    dbo.grl_locations AS l
    LEFT JOIN dbo.grl_countries AS co ON l.country_id = co.id
    LEFT JOIN dbo.grl_states AS s ON l.state_id = s.id
    LEFT JOIN dbo.grl_cities AS ci ON l.city_id = ci.id
    LEFT JOIN dbo.grl_roadTypes AS rt1 ON l.roadType_1 = rt1.id
    LEFT JOIN dbo.grl_roadTypes AS rt2 ON l.roadType_2 = rt2.id
)
SELECT
  lp.location_id AS idLocation,
  lp.countryName_val AS countryName,
  lp.stateName_val AS stateName,
  lp.cityName_val AS cityName,
  LTRIM(
    RTRIM(
      CONCAT(
        lp.P1,
        IIF(
          lp.P2 IS NULL,
          N'',
          CONCAT(IIF(lp.P1 IS NULL, N'', N' # '), lp.P2)
        ),
        IIF(
          lp.P3 IS NULL,
          N'',
          CONCAT(
            IIF(
              lp.P1 IS NULL
              AND lp.P2 IS NULL,
              N'',
              N' - '
            ),
            lp.P3
          )
        ),
        IIF(
          lp.P4 IS NULL,
          N'',
          CONCAT(
            IIF(
              lp.P1 IS NULL
              AND lp.P2 IS NULL
              AND lp.P3 IS NULL,
              N'',
              N', '
            ),
            lp.P4
          )
        )
      )
    )
  ) AS location
FROM
  LocationParts AS lp;