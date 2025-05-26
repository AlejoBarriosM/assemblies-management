SELECT
  e.id AS idEmployee,
  e.person_id AS idPerson,
  e.user_id AS idUser,
  comp.commercialName AS companyName,
  pit.type AS identificationType,
  p.identification,
  CONCAT_WS(
    ' ',
    p.firstName,
    p.middelName,
    p.lastName,
    p.secondLastName
  ) AS employeeFullName,
  p.dateBirth AS birthDate,
  p.gender,
  nationality.name AS nationality,
  ep.bloodType,
  u.mail AS employeeEmail,
  loc.countryName AS addressCountry,
  loc.stateName AS addressState,
  loc.cityName AS addressCity,
  loc.location AS fullAddress,
  eh.hireDate,
  eh.terminationDate,
  ct.name AS contractType,
  eh.initialSalary,
  eh.probationPeriod,
  eh.remarks AS hireRemarks,
  pos.name AS positionName,
  dept.name AS departmentName,
  CONCAT_WS(
    ' ',
    boss_p.firstName,
    boss_p.middelName,
    boss_p.lastName,
    boss_p.secondLastName
  ) AS bossFullName,
  boss_pos.name AS bossPositionName,
  parent_pos.name AS parentPositionName
FROM
  dbo.emp_employees AS e
  JOIN dbo.grl_persons AS p ON e.person_id = p.id
  AND p.personType = 'Natural'
  LEFT JOIN dbo.grl_personsIdenType AS pit ON p.idenType_id = pit.id
  LEFT JOIN dbo.grl_countries AS nationality ON p.nationality_id = nationality.id
  LEFT JOIN dbo.emp_employeePersonalInfo AS ep ON ep.employee_id = e.id
  LEFT JOIN dbo.vw_FullLocationDetails AS loc ON loc.idLocation = ep.location_id
  JOIN dbo.emp_employeeHireInfo AS eh ON e.id = eh.employee_id
  LEFT JOIN dbo.emp_contract_type AS ct ON eh.contractType_id = ct.id
  JOIN dbo.emp_companyPositions AS pos ON eh.position_id = pos.id
  LEFT JOIN dbo.emp_companyPositions AS parent_pos ON pos.positionParent_id = parent_pos.id
  JOIN dbo.emp_companyDepartments AS dept ON pos.department_id = dept.id
  LEFT JOIN dbo.grl_company AS comp ON e.company_id = comp.id
  LEFT JOIN dbo.emp_employees AS boss_e ON dept.boss_id = boss_e.id
  LEFT JOIN dbo.grl_persons AS boss_p ON boss_e.person_id = boss_p.id
  AND boss_p.personType = 'Natural'
  LEFT JOIN dbo.emp_employeeHireInfo AS boss_eh ON boss_e.id = boss_eh.employee_id
  LEFT JOIN dbo.emp_companyPositions AS boss_pos ON boss_eh.position_id = boss_pos.id
  LEFT JOIN dbo.grl_users AS u ON e.user_id = u.id;