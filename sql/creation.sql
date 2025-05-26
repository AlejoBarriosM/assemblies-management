USE [assemblies_managements]
GO
/****** Object:  Table [dbo].[grl_states]    Script Date: 24/05/2025 10:49:32 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[grl_states](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [country_id] [int] NOT NULL,
    [name] [varchar](255) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_cities]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_cities](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [state_id] [int] NOT NULL,
    [name] [varchar](255) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_countries]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_countries](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](255) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_locations]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_locations](
    [id] [uniqueidentifier] NOT NULL,
    [country_id] [int] NOT NULL,
    [state_id] [int] NOT NULL,
    [city_id] [int] NOT NULL,
    [roadType_1] [int] NULL,
    [street_1] [int] NULL,
    [streetLetter_1] [varchar](2) NULL,
    [streetCom_1] [varchar](50) NULL,
    [roadType_2] [int] NULL,
    [street_2] [int] NULL,
    [streetLetter_2] [varchar](2) NULL,
    [streetCom_2] [varchar](50) NULL,
    [complement] [varchar](255) NULL,
    [postalCode] [int] NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__location__3213E83F3443DE3F] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_roadTypes]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_roadTypes](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](50) NULL,
    [abbreviation] [varchar](50) NULL,
    [createdAt] [datetime2](7) NULL,
    [updatedAt] [datetime2](7) NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK_grl_roadTypes] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  View [dbo].[vw_FullLocationDetails]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE VIEW [dbo].[vw_FullLocationDetails]
AS
    WITH LocationParts AS (
    -- Paso 1: Seleccionar y pre-procesar las partes de la dirección
    SELECT
    l.id AS location_id, -- ID de la ubicación original
    co.name AS countryName_val,
    s.name AS stateName_val,
    ci.name AS cityName_val,
    -- Parte 1 de la dirección: Tipo de vía principal, número/nombre, letra y complemento (ej: Carrera 70 A Bis)
    NULLIF(
    CONCAT_WS(' ',
    rt1.name,
    CAST(l.street_1 AS VARCHAR(255)), -- Permite nombres de calle además de números
    l.streetLetter_1,
    l.streetCom_1
),
    '') AS P1,
    -- Parte 2 de la dirección: Tipo de vía secundaria (si aplica), número/nombre, letra (ej: Lote 5 B, o Calle 15 A)
    NULLIF(
    CONCAT_WS(' ',
    rt2.name, -- Nombre del segundo tipo de vía
    CAST(l.street_2 AS VARCHAR(255)), -- Permite nombres/números
    l.streetLetter_2
),
    '') AS P2,
    -- Parte 3 de la dirección: Complemento de placa (ej: 30, usualmente después de un guion)
    NULLIF(LTRIM(RTRIM(l.streetCom_2)), '') AS P3,
    -- Parte 4 de la dirección: Otros complementos (ej: Apto 101, Interior 2)
    NULLIF(LTRIM(RTRIM(l.complement)), '') AS P4
    FROM
    dbo.grl_locations l
    LEFT JOIN
    dbo.grl_countries co ON l.country_id = co.id
    LEFT JOIN
    dbo.grl_states s ON l.state_id = s.id
    LEFT JOIN
    dbo.grl_cities ci ON l.city_id = ci.id
    LEFT JOIN
    dbo.grl_roadTypes rt1 ON l.roadType_1 = rt1.id -- Nombre para el primer tipo de vía
    LEFT JOIN
    dbo.grl_roadTypes rt2 ON l.roadType_2 = rt2.id -- Nombre para el segundo tipo de vía (si existe)
)
-- Paso 2: Ensamblar las partes de la dirección con la lógica de separadores colombianos (#, -, ,)
SELECT
    lp.location_id AS idLocation,
    lp.countryName_val AS countryName,
    lp.stateName_val AS stateName,
    lp.cityName_val AS cityName,
    LTRIM(RTRIM( -- Limpieza final de espacios
            CONCAT(
                    lp.P1, -- Parte principal de la dirección
            -- Añadir P2 con '#' si P2 existe y P1 también existe. Si P1 no existe, P2 va sin prefijo.
                    IIF(lp.P2 IS NULL, N'', CONCAT(IIF(lp.P1 IS NULL, N'', N' # '), lp.P2)),
                -- Añadir P3 con '-' si P3 existe y (P1 o P2) también existen. Si P1 y P2 no existen, P3 va sin prefijo.
                    IIF(lp.P3 IS NULL, N'', CONCAT(IIF(lp.P1 IS NULL AND lp.P2 IS NULL, N'', N' - '), lp.P3)),
                -- Añadir P4 con ',' si P4 existe y (P1 o P2 o P3) también existen. Si P1, P2 y P3 no existen, P4 va sin prefijo.
                    IIF(lp.P4 IS NULL, N'', CONCAT(IIF(lp.P1 IS NULL AND lp.P2 IS NULL AND lp.P3 IS NULL, N'', N', '), lp.P4))
            )
          )) AS location
FROM
    LocationParts lp;
GO
/****** Object:  Table [dbo].[grl_users]    Script Date: 24/05/2025 10:49:32 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[grl_users](
    [id] [uniqueidentifier] NOT NULL,
    [username] [varchar](255) NOT NULL,
    [password] [varchar](255) NOT NULL,
    [role_id] [int] NULL,
    [mail] [varchar](255) NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [status] [bit] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_persons]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_persons](
    [id] [uniqueidentifier] NOT NULL,
    [idenType_id] [int] NOT NULL,
    [identification] [varchar](255) NOT NULL,
    [personType] [nchar](10) NOT NULL,
    [firstName] [varchar](50) NULL,
    [middelName] [varchar](50) NULL,
    [lastName] [varchar](50) NULL,
    [secondLastName] [varchar](50) NULL,
    [legalName] [varchar](255) NULL,
    [dateBirth] [date] NULL,
    [gender] [varchar](50) NULL,
    [nationality_id] [int] NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__persons__3213E83F4C2561E7] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    CONSTRAINT [UQ__persons__AAA7C1F522749F79] UNIQUE NONCLUSTERED
(
[identification] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_companyDepartments]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_companyDepartments](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](255) NOT NULL,
    [description] [varchar](255) NULL,
    [company_id] [uniqueidentifier] NOT NULL,
    [departmentParent_id] [int] NULL,
    [boss_id] [uniqueidentifier] NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_companyPositions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_companyPositions](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](255) NOT NULL,
    [description] [varchar](255) NULL,
    [positionParent_id] [int] NULL,
    [department_id] [int] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_company]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_company](
    [id] [uniqueidentifier] NOT NULL,
    [nit] [int] NOT NULL,
    [dv] [int] NOT NULL,
    [commercialName] [varchar](255) NOT NULL,
    [legalName] [varchar](255) NOT NULL,
    [location_id] [uniqueidentifier] NULL,
    [legalRepresentative_id] [uniqueidentifier] NULL,
    [contactPhone] [decimal](18, 0) NOT NULL,
    [email] [varchar](255) NOT NULL,
    [website] [varchar](255) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__company__3213E83FC1194C51] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_employeePersonalInfo]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_employeePersonalInfo](
    [id] [uniqueidentifier] NOT NULL,
    [employee_id] [uniqueidentifier] NOT NULL,
    [bloodType] [varchar](5) NULL,
    [location_id] [uniqueidentifier] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_employees]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_employees](
    [id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [user_id] [uniqueidentifier] NOT NULL,
    [company_id] [uniqueidentifier] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_employeeHireInfo]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_employeeHireInfo](
    [id] [uniqueidentifier] NOT NULL,
    [employee_id] [uniqueidentifier] NOT NULL,
    [hireDate] [date] NOT NULL,
    [contractType_id] [int] NOT NULL,
    [initialSalary] [decimal](10, 2) NOT NULL,
    [position_id] [int] NOT NULL,
    [probationPeriod] [int] NULL,
    [terminationDate] [date] NULL,
    [remarks] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__employee__3213E83F0C7C1C45] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_contract_type]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_contract_type](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](50) NOT NULL,
    [description] [nvarchar](max) NULL,
    [time] [int] NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__contract__3213E83FBFBEBB10] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    CONSTRAINT [UQ__contract__72E12F1B7062DEF5] UNIQUE NONCLUSTERED
(
[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_personsIdenType]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_personsIdenType](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [type] [varchar](50) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  View [dbo].[vw_EmployeeDetailsImproved]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE VIEW [dbo].[vw_EmployeeDetailsImproved] AS
SELECT
    -- Identificadores del Empleado
    e.id AS idEmployee,
    e.person_id AS idPerson,         -- ID de la persona asociada al empleado
    e.user_id AS idUser,             -- ID del usuario asociado al empleado
    comp.commercialName AS companyName, -- Nombre de la compañía del empleado

    -- Detalles Personales del Empleado
    pit.type AS identificationType,  -- Tipo de identificación (ej: Cédula, Pasaporte)
    p.identification,                -- Número de identificación
    CONCAT_WS(' ', p.firstName, p.middelName, p.lastName, p.secondLastName) AS employeeFullName, -- Nombre completo
    p.dateBirth AS birthDate,
    p.gender,
    nationality.name AS nationality, -- País de nacionalidad
    ep.bloodType,
    u.mail AS employeeEmail,         -- Email del empleado (desde la tabla de usuarios)

    -- Detalles de Ubicación del Empleado (desde la vista vw_FullLocationDetails)
    loc.countryName AS addressCountry,
    loc.stateName AS addressState,
    loc.cityName AS addressCity,
    loc.location AS fullAddress,

    -- Información de Contratación
    eh.hireDate,
    eh.terminationDate,
    ct.name AS contractType,
    eh.initialSalary,
    eh.probationPeriod,
    eh.remarks AS hireRemarks,

    -- Posición y Departamento del Empleado
    pos.name AS positionName,        -- Nombre del cargo del empleado
    dept.name AS departmentName,     -- Nombre del departamento

    -- Información del Jefe Directo (Jefe del Departamento)
    CONCAT_WS(' ', boss_p.firstName, boss_p.middelName, boss_p.lastName, boss_p.secondLastName) AS bossFullName, -- Nombre completo del jefe
    boss_pos.name AS bossPositionName, -- Cargo del jefe directo

    -- Información de la Posición Padre (del cargo del empleado)
    parent_pos.name AS parentPositionName -- Nombre del cargo padre (lo que tenías como bossPosition)

FROM
    dbo.emp_employees e
        INNER JOIN -- Un empleado siempre debe tener una persona asociada
        dbo.grl_persons p ON e.person_id = p.id AND p.personType = 'Natural' -- Aseguramos que sea persona natural
        LEFT JOIN -- El tipo de identificación podría ser opcional o no estar registrado
        dbo.grl_personsIdenType pit ON p.idenType_id = pit.id
        LEFT JOIN -- La nacionalidad podría ser opcional
        dbo.grl_countries nationality ON p.nationality_id = nationality.id
        LEFT JOIN -- La información personal adicional podría ser opcional
        dbo.emp_employeePersonalInfo ep ON ep.employee_id = e.id
        LEFT JOIN -- La ubicación podría ser opcional
        dbo.vw_FullLocationDetails loc ON loc.idLocation = ep.location_id
        INNER JOIN -- La información de contratación es esencial para un empleado activo
        dbo.emp_employeeHireInfo eh ON e.id = eh.employee_id
        LEFT JOIN -- El tipo de contrato podría no estar siempre
        dbo.emp_contract_type ct ON eh.contractType_id = ct.id
        INNER JOIN -- La posición es esencial
        dbo.emp_companyPositions pos ON eh.position_id = pos.id
        LEFT JOIN -- No todas las posiciones tienen una posición padre (ej: Gerente General)
        dbo.emp_companyPositions parent_pos ON pos.positionParent_id = parent_pos.id
        INNER JOIN -- El departamento es esencial para una posición
        dbo.emp_companyDepartments dept ON pos.department_id = dept.id
        LEFT JOIN -- El empleado podría pertenecer a una empresa (útil si hay múltiples compañías)
        dbo.grl_company comp ON e.company_id = comp.id
        LEFT JOIN -- Un departamento podría no tener un jefe asignado, o el jefe no estar activo
        dbo.emp_employees boss_e ON dept.boss_id = boss_e.id -- Buscamos al empleado que es jefe del departamento
        LEFT JOIN
    dbo.grl_persons boss_p ON boss_e.person_id = boss_p.id AND boss_p.personType = 'Natural' -- Datos personales del jefe
        LEFT JOIN -- Para obtener el cargo del jefe
        dbo.emp_employeeHireInfo boss_eh ON boss_e.id = boss_eh.employee_id
        LEFT JOIN
    dbo.emp_companyPositions boss_pos ON boss_eh.position_id = boss_pos.id
        LEFT JOIN -- Para obtener el email del empleado desde su usuario
        dbo.grl_users u ON e.user_id = u.id;
GO
/****** Object:  Table [dbo].[asb_assemblies]    Script Date: 24/05/2025 10:49:32 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[asb_assemblies](
    [id] [uniqueidentifier] NOT NULL,
    [customer_id] [uniqueidentifier] NOT NULL,
    [assemblyType_id] [uniqueidentifier] NOT NULL,
    [assemblyDate] [date] NOT NULL,
    [description] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_assembliesTypes]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_assembliesTypes](
    [id] [uniqueidentifier] NOT NULL,
    [typeName] [varchar](255) NOT NULL,
    [typeDescription] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[typeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_documents]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_documents](
    [id] [uniqueidentifier] NOT NULL,
    [assembly_id] [uniqueidentifier] NOT NULL,
    [documentName] [varchar](255) NOT NULL,
    [documentType] [varchar](50) NULL,
    [documentUrl] [nvarchar](max) NULL,
    [description] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_documentVersions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_documentVersions](
    [id] [uniqueidentifier] NOT NULL,
    [document_id] [uniqueidentifier] NOT NULL,
    [versionNumber] [int] NOT NULL,
    [documentUrl] [nvarchar](max) NOT NULL,
    [changeLog] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_meetingAgendas]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_meetingAgendas](
    [id] [uniqueidentifier] NOT NULL,
    [meeting_id] [uniqueidentifier] NOT NULL,
    [agendaItemNumber] [int] NOT NULL,
    [agendaTitle] [varchar](255) NOT NULL,
    [agendaDescription] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_meetingAttendance]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_meetingAttendance](
    [id] [uniqueidentifier] NOT NULL,
    [meeting_id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [present] [bit] NOT NULL,
    [arrivalTime] [datetime2](7) NULL,
    [departureTime] [datetime2](7) NULL,
    [notes] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_meetingMinutes]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_meetingMinutes](
    [id] [uniqueidentifier] NOT NULL,
    [meeting_id] [uniqueidentifier] NOT NULL,
    [minuteContent] [nvarchar](max) NOT NULL,
    [recordedBy_person_id] [uniqueidentifier] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_meetings]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_meetings](
    [id] [uniqueidentifier] NOT NULL,
    [assembly_id] [uniqueidentifier] NOT NULL,
    [meetingType_id] [uniqueidentifier] NOT NULL,
    [meetingDate] [date] NOT NULL,
    [meetingStartTime] [datetime2](7) NOT NULL,
    [meetingEndTime] [datetime2](7) NOT NULL,
    [location_id] [uniqueidentifier] NULL,
    [agenda] [nvarchar](max) NULL,
    [minutes] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_meetingsProposals]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_meetingsProposals](
    [id] [uniqueidentifier] NOT NULL,
    [meeting_id] [uniqueidentifier] NOT NULL,
    [proposalTitle] [varchar](255) NOT NULL,
    [proposalDescription] [nvarchar](max) NULL,
    [proposalsType_id] [uniqueidentifier] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_meetingsTypes]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_meetingsTypes](
    [id] [uniqueidentifier] NOT NULL,
    [typeName] [varchar](255) NOT NULL,
    [typeDescription] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[typeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_proposalsTypes]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_proposalsTypes](
    [id] [uniqueidentifier] NOT NULL,
    [typeName] [varchar](255) NOT NULL,
    [typeDescription] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[typeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_proposalsVoting]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_proposalsVoting](
    [id] [uniqueidentifier] NOT NULL,
    [meetingProposal_id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [vote] [varchar](50) NOT NULL,
    [remarks] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_resolutions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_resolutions](
    [id] [uniqueidentifier] NOT NULL,
    [assembly_id] [uniqueidentifier] NOT NULL,
    [resolutionTitle] [varchar](255) NOT NULL,
    [resolutionContent] [nvarchar](max) NOT NULL,
    [approved] [bit] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[asb_signsDocuments]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[asb_signsDocuments](
    [id] [uniqueidentifier] NOT NULL,
    [document_id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [signDate] [datetime2](7) NOT NULL,
    [signMethod] [varchar](50) NOT NULL,
    [signImage] [varchar](255) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[cus_customerRoles]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[cus_customerRoles](
    [id] [uniqueidentifier] NOT NULL,
    [roleName] [varchar](50) NOT NULL,
    [roleDescription] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[roleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[cus_customers]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[cus_customers](
    [id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [customerType] [varchar](50) NULL,
    [location_id] [uniqueidentifier] NULL,
    [email] [varchar](255) NOT NULL,
    [phone] [varchar](20) NOT NULL,
    [logo] [nvarchar](max) NULL,
    [stocks] [int] NULL,
    [percentage] [decimal](18, 0) NULL,
    [status] [bit] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__customer__3213E83FADA95E16] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[cus_customersRepresentatives]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[cus_customersRepresentatives](
    [id] [uniqueidentifier] NOT NULL,
    [customer_id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [customerRole_id] [uniqueidentifier] NOT NULL,
    [startDate] [date] NOT NULL,
    [endDate] [date] NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[cus_shareholderRepresentatives]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[cus_shareholderRepresentatives](
    [id] [uniqueidentifier] NOT NULL,
    [shareholder_id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [startDate] [date] NOT NULL,
    [endDate] [date] NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[cus_shareholders]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[cus_shareholders](
    [id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [customer_id] [uniqueidentifier] NOT NULL,
    [shareCount] [int] NOT NULL,
    [sharePercentage] [decimal](5, 2) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_employeeExperiencesInfo]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_employeeExperiencesInfo](
    [id] [uniqueidentifier] NOT NULL,
    [employee_id] [uniqueidentifier] NOT NULL,
    [companyName] [varchar](255) NOT NULL,
    [jobTitle] [varchar](255) NOT NULL,
    [startDate] [date] NOT NULL,
    [endDate] [date] NULL,
    [responsibilities] [nvarchar](max) NULL,
    [achievements] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_employeeStudiesInfo]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_employeeStudiesInfo](
    [id] [uniqueidentifier] NOT NULL,
    [employee_id] [uniqueidentifier] NOT NULL,
    [institution] [varchar](255) NOT NULL,
    [degree] [varchar](255) NOT NULL,
    [fieldStudy] [varchar](255) NOT NULL,
    [startDate] [date] NOT NULL,
    [endDate] [date] NULL,
    [grade] [varchar](50) NULL,
    [description] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_payroll]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_payroll](
    [id] [uniqueidentifier] NOT NULL,
    [employee_id] [uniqueidentifier] NOT NULL,
    [payrollDate] [date] NOT NULL,
    [payPeriodStart] [date] NOT NULL,
    [payPeriodEnd] [date] NOT NULL,
    [totalEarnings] [decimal](10, 2) NOT NULL,
    [totalDeductions] [decimal](10, 2) NOT NULL,
    [netPay] [decimal](10, 2) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_payrollConcepts]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_payrollConcepts](
    [id] [uniqueidentifier] NOT NULL,
    [conceptName] [varchar](255) NOT NULL,
    [conceptType] [varchar](50) NOT NULL,
    [conceptDescription] [nvarchar](max) NULL,
    [value] [numeric](18, 0) NULL,
    [percentage] [float] NULL,
    [isTaxable] [bit] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK__payrollC__3213E83FCE2FE30D] PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_payrollDeductions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_payrollDeductions](
    [id] [uniqueidentifier] NOT NULL,
    [payroll_id] [uniqueidentifier] NOT NULL,
    [payrollConcept_id] [uniqueidentifier] NOT NULL,
    [deductionAmount] [decimal](10, 2) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[emp_payrollPerceptions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[emp_payrollPerceptions](
    [id] [uniqueidentifier] NOT NULL,
    [payroll_id] [uniqueidentifier] NOT NULL,
    [payrollConcept_id] [uniqueidentifier] NOT NULL,
    [perceptionAmount] [decimal](10, 2) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_auditLogs]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_auditLogs](
    [id] [uniqueidentifier] NOT NULL,
    [tableName] [varchar](255) NOT NULL,
    [recordId] [uniqueidentifier] NULL,
    [action] [varchar](50) NOT NULL,
    [changeDetails] [nvarchar](max) NULL,
    [changedBy] [uniqueidentifier] NULL,
    [changeDate] [datetime2](7) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_configs]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_configs](
    [keys] [varchar](50) NOT NULL,
    [value] [varchar](255) NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[keys] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_notifications]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_notifications](
    [id] [uniqueidentifier] NOT NULL,
    [user_id] [uniqueidentifier] NOT NULL,
    [message] [nvarchar](max) NOT NULL,
    [notificationDate] [datetime2](7) NOT NULL,
    [isRead] [bit] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_permissions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_permissions](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](50) NOT NULL,
    [description] [varchar](255) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_profile]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_profile](
    [id] [uniqueidentifier] NOT NULL,
    [user_id] [uniqueidentifier] NOT NULL,
    [person_id] [uniqueidentifier] NOT NULL,
    [theme] [int] NOT NULL,
    [photo] [varchar](255) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_rolePermissions]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_rolePermissions](
    [role_id] [int] NOT NULL,
    [permission_id] [int] NOT NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    CONSTRAINT [PK_rolePermissions] PRIMARY KEY CLUSTERED
(
    [role_id] ASC,
[permission_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[grl_roles]    Script Date: 24/05/2025 10:49:32 a. m. ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[grl_roles](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [varchar](50) NOT NULL,
    [description] [varchar](255) NULL,
    [createdAt] [datetime2](7) NOT NULL,
    [updatedAt] [datetime2](7) NOT NULL,
    [deletedAt] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED
(
[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
ALTER TABLE [dbo].[asb_assemblies] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_assemblies] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_assemblies] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_assembliesTypes] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_assembliesTypes] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_assembliesTypes] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_documents] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_documents] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_documents] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_documentVersions] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_documentVersions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_documentVersions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_meetingAgendas] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_meetingAgendas] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_meetingAgendas] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_meetingAttendance] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_meetingAttendance] ADD  DEFAULT ((0)) FOR [present]
    GO
ALTER TABLE [dbo].[asb_meetingAttendance] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_meetingAttendance] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_meetingMinutes] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_meetingMinutes] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_meetingMinutes] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_meetings] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_meetings] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_meetings] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_meetingsProposals] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_meetingsProposals] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_meetingsProposals] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_meetingsTypes] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_meetingsTypes] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_meetingsTypes] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_proposalsTypes] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_proposalsTypes] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_proposalsTypes] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_proposalsVoting] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_proposalsVoting] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_proposalsVoting] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_resolutions] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_resolutions] ADD  DEFAULT ((0)) FOR [approved]
    GO
ALTER TABLE [dbo].[asb_resolutions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_resolutions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_signsDocuments] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[asb_signsDocuments] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[asb_signsDocuments] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[cus_customerRoles] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[cus_customerRoles] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[cus_customerRoles] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[cus_customers] ADD  CONSTRAINT [DF__customers__id__2EDAF651]  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[cus_customers] ADD  CONSTRAINT [DF__customers__statu__2FCF1A8A]  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[cus_customers] ADD  CONSTRAINT [DF__customers__creat__30C33EC3]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[cus_customers] ADD  CONSTRAINT [DF__customers__updat__31B762FC]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[cus_shareholders] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[cus_shareholders] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[cus_shareholders] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_companyDepartments] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_companyDepartments] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_companyPositions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_companyPositions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_contract_type] ADD  CONSTRAINT [DF__contract___creat__282DF8C2]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_contract_type] ADD  CONSTRAINT [DF__contract___updat__29221CFB]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_employeeExperiencesInfo] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_employeeExperiencesInfo] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_employeeExperiencesInfo] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo] ADD  CONSTRAINT [DF__employeeHire__id__3E1D39E1]  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo] ADD  CONSTRAINT [DF__employeeH__creat__3F115E1A]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo] ADD  CONSTRAINT [DF__employeeH__updat__40058253]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_employees] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_employees] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_employees] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_employeeStudiesInfo] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_employeeStudiesInfo] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_employeeStudiesInfo] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_payroll] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_payroll] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_payroll] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_payrollConcepts] ADD  CONSTRAINT [DF__payrollConce__id__662B2B3B]  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_payrollConcepts] ADD  CONSTRAINT [DF__payrollCo__isTax__671F4F74]  DEFAULT ((0)) FOR [isTaxable]
    GO
ALTER TABLE [dbo].[emp_payrollConcepts] ADD  CONSTRAINT [DF__payrollCo__creat__681373AD]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_payrollConcepts] ADD  CONSTRAINT [DF__payrollCo__updat__690797E6]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_payrollDeductions] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_payrollDeductions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_payrollDeductions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_auditLogs] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_auditLogs] ADD  DEFAULT (getdate()) FOR [changeDate]
    GO
ALTER TABLE [dbo].[grl_cities] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_cities] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_company] ADD  CONSTRAINT [DF__company__id__1F98B2C1]  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_company] ADD  CONSTRAINT [DF__company__created__208CD6FA]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_company] ADD  CONSTRAINT [DF__company__updated__2180FB33]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_configs] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_configs] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_countries] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_countries] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_locations] ADD  CONSTRAINT [DF__locations__id__498EEC8D]  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_locations] ADD  CONSTRAINT [DF__locations__creat__4A8310C6]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_locations] ADD  CONSTRAINT [DF__locations__updat__4B7734FF]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_notifications] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_notifications] ADD  DEFAULT (getdate()) FOR [notificationDate]
    GO
ALTER TABLE [dbo].[grl_notifications] ADD  DEFAULT ((0)) FOR [isRead]
    GO
ALTER TABLE [dbo].[grl_notifications] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_notifications] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_permissions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_permissions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_persons] ADD  CONSTRAINT [DF__persons__id__719CDDE7]  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_persons] ADD  CONSTRAINT [DF__persons__created__72910220]  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_persons] ADD  CONSTRAINT [DF__persons__updated__73852659]  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_personsIdenType] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_personsIdenType] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_profile] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_profile] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_profile] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_rolePermissions] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_rolePermissions] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_roles] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_roles] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_states] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_states] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[grl_users] ADD  DEFAULT (newid()) FOR [id]
    GO
ALTER TABLE [dbo].[grl_users] ADD  DEFAULT (getdate()) FOR [createdAt]
    GO
ALTER TABLE [dbo].[grl_users] ADD  DEFAULT (getdate()) FOR [updatedAt]
    GO
ALTER TABLE [dbo].[asb_assemblies]  WITH CHECK ADD  CONSTRAINT [FK_assemblies_assemblyType] FOREIGN KEY([assemblyType_id])
    REFERENCES [dbo].[asb_assembliesTypes] ([id])
    GO
ALTER TABLE [dbo].[asb_assemblies] CHECK CONSTRAINT [FK_assemblies_assemblyType]
    GO
ALTER TABLE [dbo].[asb_assemblies]  WITH CHECK ADD  CONSTRAINT [FK_assemblies_customer] FOREIGN KEY([customer_id])
    REFERENCES [dbo].[cus_customers] ([id])
    GO
ALTER TABLE [dbo].[asb_assemblies] CHECK CONSTRAINT [FK_assemblies_customer]
    GO
ALTER TABLE [dbo].[asb_documents]  WITH CHECK ADD  CONSTRAINT [FK_documents_assembly] FOREIGN KEY([assembly_id])
    REFERENCES [dbo].[asb_assemblies] ([id])
    GO
ALTER TABLE [dbo].[asb_documents] CHECK CONSTRAINT [FK_documents_assembly]
    GO
ALTER TABLE [dbo].[asb_documentVersions]  WITH CHECK ADD  CONSTRAINT [FK_documentVersions_document] FOREIGN KEY([document_id])
    REFERENCES [dbo].[asb_documents] ([id])
    GO
ALTER TABLE [dbo].[asb_documentVersions] CHECK CONSTRAINT [FK_documentVersions_document]
    GO
ALTER TABLE [dbo].[asb_meetingAgendas]  WITH CHECK ADD  CONSTRAINT [FK_meetingAgendas_meeting] FOREIGN KEY([meeting_id])
    REFERENCES [dbo].[asb_meetings] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingAgendas] CHECK CONSTRAINT [FK_meetingAgendas_meeting]
    GO
ALTER TABLE [dbo].[asb_meetingAttendance]  WITH CHECK ADD  CONSTRAINT [FK_meetingAttendance_meeting] FOREIGN KEY([meeting_id])
    REFERENCES [dbo].[asb_meetings] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingAttendance] CHECK CONSTRAINT [FK_meetingAttendance_meeting]
    GO
ALTER TABLE [dbo].[asb_meetingAttendance]  WITH CHECK ADD  CONSTRAINT [FK_meetingAttendance_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingAttendance] CHECK CONSTRAINT [FK_meetingAttendance_person]
    GO
ALTER TABLE [dbo].[asb_meetingMinutes]  WITH CHECK ADD  CONSTRAINT [FK_meetingMinutes_meeting] FOREIGN KEY([meeting_id])
    REFERENCES [dbo].[asb_meetings] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingMinutes] CHECK CONSTRAINT [FK_meetingMinutes_meeting]
    GO
ALTER TABLE [dbo].[asb_meetingMinutes]  WITH CHECK ADD  CONSTRAINT [FK_meetingMinutes_recordedBy] FOREIGN KEY([recordedBy_person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingMinutes] CHECK CONSTRAINT [FK_meetingMinutes_recordedBy]
    GO
ALTER TABLE [dbo].[asb_meetings]  WITH CHECK ADD  CONSTRAINT [FK_meetings_assembly] FOREIGN KEY([assembly_id])
    REFERENCES [dbo].[asb_assemblies] ([id])
    GO
ALTER TABLE [dbo].[asb_meetings] CHECK CONSTRAINT [FK_meetings_assembly]
    GO
ALTER TABLE [dbo].[asb_meetings]  WITH CHECK ADD  CONSTRAINT [FK_meetings_location] FOREIGN KEY([location_id])
    REFERENCES [dbo].[grl_locations] ([id])
    GO
ALTER TABLE [dbo].[asb_meetings] CHECK CONSTRAINT [FK_meetings_location]
    GO
ALTER TABLE [dbo].[asb_meetings]  WITH CHECK ADD  CONSTRAINT [FK_meetings_meetingType] FOREIGN KEY([meetingType_id])
    REFERENCES [dbo].[asb_meetingsTypes] ([id])
    GO
ALTER TABLE [dbo].[asb_meetings] CHECK CONSTRAINT [FK_meetings_meetingType]
    GO
ALTER TABLE [dbo].[asb_meetingsProposals]  WITH CHECK ADD  CONSTRAINT [FK_meetingsProposals_meeting] FOREIGN KEY([meeting_id])
    REFERENCES [dbo].[asb_meetings] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingsProposals] CHECK CONSTRAINT [FK_meetingsProposals_meeting]
    GO
ALTER TABLE [dbo].[asb_meetingsProposals]  WITH CHECK ADD  CONSTRAINT [FK_meetingsProposals_proposalsType] FOREIGN KEY([proposalsType_id])
    REFERENCES [dbo].[asb_proposalsTypes] ([id])
    GO
ALTER TABLE [dbo].[asb_meetingsProposals] CHECK CONSTRAINT [FK_meetingsProposals_proposalsType]
    GO
ALTER TABLE [dbo].[asb_proposalsVoting]  WITH CHECK ADD  CONSTRAINT [FK_proposalsVoting_meetingProposal] FOREIGN KEY([meetingProposal_id])
    REFERENCES [dbo].[asb_meetingsProposals] ([id])
    GO
ALTER TABLE [dbo].[asb_proposalsVoting] CHECK CONSTRAINT [FK_proposalsVoting_meetingProposal]
    GO
ALTER TABLE [dbo].[asb_proposalsVoting]  WITH CHECK ADD  CONSTRAINT [FK_proposalsVoting_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[asb_proposalsVoting] CHECK CONSTRAINT [FK_proposalsVoting_person]
    GO
ALTER TABLE [dbo].[asb_resolutions]  WITH CHECK ADD  CONSTRAINT [FK_resolutions_assembly] FOREIGN KEY([assembly_id])
    REFERENCES [dbo].[asb_assemblies] ([id])
    GO
ALTER TABLE [dbo].[asb_resolutions] CHECK CONSTRAINT [FK_resolutions_assembly]
    GO
ALTER TABLE [dbo].[asb_signsDocuments]  WITH CHECK ADD  CONSTRAINT [FK_signsDocuments_document] FOREIGN KEY([document_id])
    REFERENCES [dbo].[asb_documents] ([id])
    GO
ALTER TABLE [dbo].[asb_signsDocuments] CHECK CONSTRAINT [FK_signsDocuments_document]
    GO
ALTER TABLE [dbo].[asb_signsDocuments]  WITH CHECK ADD  CONSTRAINT [FK_signsDocuments_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[asb_signsDocuments] CHECK CONSTRAINT [FK_signsDocuments_person]
    GO
ALTER TABLE [dbo].[cus_customers]  WITH CHECK ADD  CONSTRAINT [FK_customers_location] FOREIGN KEY([location_id])
    REFERENCES [dbo].[grl_locations] ([id])
    GO
ALTER TABLE [dbo].[cus_customers] CHECK CONSTRAINT [FK_customers_location]
    GO
ALTER TABLE [dbo].[cus_customers]  WITH CHECK ADD  CONSTRAINT [FK_customers_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[cus_customers] CHECK CONSTRAINT [FK_customers_person]
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives]  WITH CHECK ADD  CONSTRAINT [FK_customersRepresentatives_customer] FOREIGN KEY([customer_id])
    REFERENCES [dbo].[cus_customers] ([id])
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives] CHECK CONSTRAINT [FK_customersRepresentatives_customer]
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives]  WITH CHECK ADD  CONSTRAINT [FK_customersRepresentatives_customerRole] FOREIGN KEY([customerRole_id])
    REFERENCES [dbo].[cus_customerRoles] ([id])
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives] CHECK CONSTRAINT [FK_customersRepresentatives_customerRole]
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives]  WITH CHECK ADD  CONSTRAINT [FK_customersRepresentatives_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[cus_customersRepresentatives] CHECK CONSTRAINT [FK_customersRepresentatives_person]
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives]  WITH CHECK ADD  CONSTRAINT [FK_shareholderRepresentatives_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives] CHECK CONSTRAINT [FK_shareholderRepresentatives_person]
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives]  WITH CHECK ADD  CONSTRAINT [FK_shareholderRepresentatives_shareholder] FOREIGN KEY([shareholder_id])
    REFERENCES [dbo].[cus_shareholders] ([id])
    GO
ALTER TABLE [dbo].[cus_shareholderRepresentatives] CHECK CONSTRAINT [FK_shareholderRepresentatives_shareholder]
    GO
ALTER TABLE [dbo].[cus_shareholders]  WITH CHECK ADD  CONSTRAINT [FK_shareholders_customer] FOREIGN KEY([customer_id])
    REFERENCES [dbo].[cus_customers] ([id])
    GO
ALTER TABLE [dbo].[cus_shareholders] CHECK CONSTRAINT [FK_shareholders_customer]
    GO
ALTER TABLE [dbo].[cus_shareholders]  WITH CHECK ADD  CONSTRAINT [FK_shareholders_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[cus_shareholders] CHECK CONSTRAINT [FK_shareholders_person]
    GO
ALTER TABLE [dbo].[emp_companyDepartments]  WITH CHECK ADD  CONSTRAINT [FK_companyDepartaments_boss] FOREIGN KEY([boss_id])
    REFERENCES [dbo].[emp_employees] ([id])
    ON DELETE SET NULL
GO
ALTER TABLE [dbo].[emp_companyDepartments] CHECK CONSTRAINT [FK_companyDepartaments_boss]
    GO
ALTER TABLE [dbo].[emp_companyDepartments]  WITH CHECK ADD  CONSTRAINT [FK_companyDepartaments_company] FOREIGN KEY([company_id])
    REFERENCES [dbo].[grl_company] ([id])
    GO
ALTER TABLE [dbo].[emp_companyDepartments] CHECK CONSTRAINT [FK_companyDepartaments_company]
    GO
ALTER TABLE [dbo].[emp_companyDepartments]  WITH CHECK ADD  CONSTRAINT [FK_companyDepartaments_parent] FOREIGN KEY([departmentParent_id])
    REFERENCES [dbo].[emp_companyDepartments] ([id])
    GO
ALTER TABLE [dbo].[emp_companyDepartments] CHECK CONSTRAINT [FK_companyDepartaments_parent]
    GO
ALTER TABLE [dbo].[emp_companyPositions]  WITH CHECK ADD  CONSTRAINT [FK_companyPositions_department] FOREIGN KEY([department_id])
    REFERENCES [dbo].[emp_companyDepartments] ([id])
    GO
ALTER TABLE [dbo].[emp_companyPositions] CHECK CONSTRAINT [FK_companyPositions_department]
    GO
ALTER TABLE [dbo].[emp_companyPositions]  WITH CHECK ADD  CONSTRAINT [FK_companyPositions_parent] FOREIGN KEY([positionParent_id])
    REFERENCES [dbo].[emp_companyPositions] ([id])
    GO
ALTER TABLE [dbo].[emp_companyPositions] CHECK CONSTRAINT [FK_companyPositions_parent]
    GO
ALTER TABLE [dbo].[emp_employeeExperiencesInfo]  WITH CHECK ADD  CONSTRAINT [FK_employeeExperiencesInfo_employee] FOREIGN KEY([employee_id])
    REFERENCES [dbo].[emp_employees] ([id])
    GO
ALTER TABLE [dbo].[emp_employeeExperiencesInfo] CHECK CONSTRAINT [FK_employeeExperiencesInfo_employee]
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo]  WITH CHECK ADD  CONSTRAINT [FK_employeeHireInfo_contractType] FOREIGN KEY([contractType_id])
    REFERENCES [dbo].[emp_contract_type] ([id])
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo] CHECK CONSTRAINT [FK_employeeHireInfo_contractType]
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo]  WITH CHECK ADD  CONSTRAINT [FK_employeeHireInfo_employee] FOREIGN KEY([employee_id])
    REFERENCES [dbo].[emp_employees] ([id])
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo] CHECK CONSTRAINT [FK_employeeHireInfo_employee]
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo]  WITH CHECK ADD  CONSTRAINT [FK_employeeHireInfo_positions] FOREIGN KEY([position_id])
    REFERENCES [dbo].[emp_companyPositions] ([id])
    GO
ALTER TABLE [dbo].[emp_employeeHireInfo] CHECK CONSTRAINT [FK_employeeHireInfo_positions]
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo]  WITH CHECK ADD  CONSTRAINT [FK_employee_location] FOREIGN KEY([location_id])
    REFERENCES [dbo].[grl_locations] ([id])
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo] CHECK CONSTRAINT [FK_employee_location]
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo]  WITH CHECK ADD  CONSTRAINT [FK_employeePersonalInfo_employee] FOREIGN KEY([employee_id])
    REFERENCES [dbo].[emp_employees] ([id])
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo] CHECK CONSTRAINT [FK_employeePersonalInfo_employee]
    GO
ALTER TABLE [dbo].[emp_employees]  WITH CHECK ADD  CONSTRAINT [FK_employees_company] FOREIGN KEY([company_id])
    REFERENCES [dbo].[grl_company] ([id])
    GO
ALTER TABLE [dbo].[emp_employees] CHECK CONSTRAINT [FK_employees_company]
    GO
ALTER TABLE [dbo].[emp_employees]  WITH CHECK ADD  CONSTRAINT [FK_employees_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[emp_employees] CHECK CONSTRAINT [FK_employees_person]
    GO
ALTER TABLE [dbo].[emp_employees]  WITH CHECK ADD  CONSTRAINT [FK_employees_user] FOREIGN KEY([user_id])
    REFERENCES [dbo].[grl_users] ([id])
    GO
ALTER TABLE [dbo].[emp_employees] CHECK CONSTRAINT [FK_employees_user]
    GO
ALTER TABLE [dbo].[emp_employeeStudiesInfo]  WITH CHECK ADD  CONSTRAINT [FK_employeeStudiesInfo_employee] FOREIGN KEY([employee_id])
    REFERENCES [dbo].[emp_employees] ([id])
    GO
ALTER TABLE [dbo].[emp_employeeStudiesInfo] CHECK CONSTRAINT [FK_employeeStudiesInfo_employee]
    GO
ALTER TABLE [dbo].[emp_payroll]  WITH CHECK ADD  CONSTRAINT [FK_payroll_employee] FOREIGN KEY([employee_id])
    REFERENCES [dbo].[emp_employees] ([id])
    GO
ALTER TABLE [dbo].[emp_payroll] CHECK CONSTRAINT [FK_payroll_employee]
    GO
ALTER TABLE [dbo].[emp_payrollDeductions]  WITH CHECK ADD  CONSTRAINT [FK_payrollDeductions_payroll] FOREIGN KEY([payroll_id])
    REFERENCES [dbo].[emp_payroll] ([id])
    GO
ALTER TABLE [dbo].[emp_payrollDeductions] CHECK CONSTRAINT [FK_payrollDeductions_payroll]
    GO
ALTER TABLE [dbo].[emp_payrollDeductions]  WITH CHECK ADD  CONSTRAINT [FK_payrollDeductions_payrollConcept] FOREIGN KEY([payrollConcept_id])
    REFERENCES [dbo].[emp_payrollConcepts] ([id])
    GO
ALTER TABLE [dbo].[emp_payrollDeductions] CHECK CONSTRAINT [FK_payrollDeductions_payrollConcept]
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions]  WITH CHECK ADD  CONSTRAINT [FK_payrollPerceptions_payroll] FOREIGN KEY([payroll_id])
    REFERENCES [dbo].[emp_payroll] ([id])
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions] CHECK CONSTRAINT [FK_payrollPerceptions_payroll]
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions]  WITH CHECK ADD  CONSTRAINT [FK_payrollPerceptions_payrollConcept] FOREIGN KEY([payrollConcept_id])
    REFERENCES [dbo].[emp_payrollConcepts] ([id])
    GO
ALTER TABLE [dbo].[emp_payrollPerceptions] CHECK CONSTRAINT [FK_payrollPerceptions_payrollConcept]
    GO
ALTER TABLE [dbo].[grl_auditLogs]  WITH CHECK ADD  CONSTRAINT [FK_auditLogs_changedBy] FOREIGN KEY([changedBy])
    REFERENCES [dbo].[grl_persons] ([id])
    ON DELETE SET NULL
GO
ALTER TABLE [dbo].[grl_auditLogs] CHECK CONSTRAINT [FK_auditLogs_changedBy]
    GO
ALTER TABLE [dbo].[grl_cities]  WITH CHECK ADD  CONSTRAINT [FK_city_state] FOREIGN KEY([state_id])
    REFERENCES [dbo].[grl_states] ([id])
    GO
ALTER TABLE [dbo].[grl_cities] CHECK CONSTRAINT [FK_city_state]
    GO
ALTER TABLE [dbo].[grl_company]  WITH CHECK ADD  CONSTRAINT [FK_company_legalRepresentative] FOREIGN KEY([legalRepresentative_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[grl_company] CHECK CONSTRAINT [FK_company_legalRepresentative]
    GO
ALTER TABLE [dbo].[grl_company]  WITH CHECK ADD  CONSTRAINT [FK_company_location] FOREIGN KEY([location_id])
    REFERENCES [dbo].[grl_locations] ([id])
    GO
ALTER TABLE [dbo].[grl_company] CHECK CONSTRAINT [FK_company_location]
    GO
ALTER TABLE [dbo].[grl_locations]  WITH CHECK ADD  CONSTRAINT [FK_grl_locations_grl_roadTypes] FOREIGN KEY([roadType_1])
    REFERENCES [dbo].[grl_roadTypes] ([id])
    GO
ALTER TABLE [dbo].[grl_locations] CHECK CONSTRAINT [FK_grl_locations_grl_roadTypes]
    GO
ALTER TABLE [dbo].[grl_locations]  WITH CHECK ADD  CONSTRAINT [FK_grl_locations_grl_roadTypes1] FOREIGN KEY([roadType_2])
    REFERENCES [dbo].[grl_roadTypes] ([id])
    GO
ALTER TABLE [dbo].[grl_locations] CHECK CONSTRAINT [FK_grl_locations_grl_roadTypes1]
    GO
ALTER TABLE [dbo].[grl_locations]  WITH CHECK ADD  CONSTRAINT [FK_locations_city] FOREIGN KEY([city_id])
    REFERENCES [dbo].[grl_cities] ([id])
    GO
ALTER TABLE [dbo].[grl_locations] CHECK CONSTRAINT [FK_locations_city]
    GO
ALTER TABLE [dbo].[grl_locations]  WITH CHECK ADD  CONSTRAINT [FK_locations_country] FOREIGN KEY([country_id])
    REFERENCES [dbo].[grl_countries] ([id])
    GO
ALTER TABLE [dbo].[grl_locations] CHECK CONSTRAINT [FK_locations_country]
    GO
ALTER TABLE [dbo].[grl_locations]  WITH CHECK ADD  CONSTRAINT [FK_locations_state] FOREIGN KEY([state_id])
    REFERENCES [dbo].[grl_states] ([id])
    GO
ALTER TABLE [dbo].[grl_locations] CHECK CONSTRAINT [FK_locations_state]
    GO
ALTER TABLE [dbo].[grl_notifications]  WITH CHECK ADD  CONSTRAINT [FK_notifications_user] FOREIGN KEY([user_id])
    REFERENCES [dbo].[grl_users] ([id])
    GO
ALTER TABLE [dbo].[grl_notifications] CHECK CONSTRAINT [FK_notifications_user]
    GO
ALTER TABLE [dbo].[grl_persons]  WITH CHECK ADD  CONSTRAINT [FK_persons_idenType] FOREIGN KEY([idenType_id])
    REFERENCES [dbo].[grl_personsIdenType] ([id])
    GO
ALTER TABLE [dbo].[grl_persons] CHECK CONSTRAINT [FK_persons_idenType]
    GO
ALTER TABLE [dbo].[grl_persons]  WITH CHECK ADD  CONSTRAINT [FK_persons_nationality] FOREIGN KEY([nationality_id])
    REFERENCES [dbo].[grl_countries] ([id])
    ON DELETE SET NULL
GO
ALTER TABLE [dbo].[grl_persons] CHECK CONSTRAINT [FK_persons_nationality]
    GO
ALTER TABLE [dbo].[grl_profile]  WITH CHECK ADD  CONSTRAINT [FK_profile_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[grl_profile] CHECK CONSTRAINT [FK_profile_person]
    GO
ALTER TABLE [dbo].[grl_profile]  WITH CHECK ADD  CONSTRAINT [FK_profile_user] FOREIGN KEY([user_id])
    REFERENCES [dbo].[grl_users] ([id])
    GO
ALTER TABLE [dbo].[grl_profile] CHECK CONSTRAINT [FK_profile_user]
    GO
ALTER TABLE [dbo].[grl_rolePermissions]  WITH CHECK ADD  CONSTRAINT [FK_rolePermissions_permission] FOREIGN KEY([permission_id])
    REFERENCES [dbo].[grl_permissions] ([id])
    GO
ALTER TABLE [dbo].[grl_rolePermissions] CHECK CONSTRAINT [FK_rolePermissions_permission]
    GO
ALTER TABLE [dbo].[grl_rolePermissions]  WITH CHECK ADD  CONSTRAINT [FK_rolePermissions_role] FOREIGN KEY([role_id])
    REFERENCES [dbo].[grl_roles] ([id])
    GO
ALTER TABLE [dbo].[grl_rolePermissions] CHECK CONSTRAINT [FK_rolePermissions_role]
    GO
ALTER TABLE [dbo].[grl_states]  WITH CHECK ADD  CONSTRAINT [FK_state_country] FOREIGN KEY([country_id])
    REFERENCES [dbo].[grl_countries] ([id])
    GO
ALTER TABLE [dbo].[grl_states] CHECK CONSTRAINT [FK_state_country]
    GO
ALTER TABLE [dbo].[grl_users]  WITH CHECK ADD  CONSTRAINT [FK_users_person] FOREIGN KEY([person_id])
    REFERENCES [dbo].[grl_persons] ([id])
    GO
ALTER TABLE [dbo].[grl_users] CHECK CONSTRAINT [FK_users_person]
    GO
ALTER TABLE [dbo].[grl_users]  WITH CHECK ADD  CONSTRAINT [FK_users_role] FOREIGN KEY([role_id])
    REFERENCES [dbo].[grl_roles] ([id])
    ON DELETE SET NULL
GO
ALTER TABLE [dbo].[grl_users] CHECK CONSTRAINT [FK_users_role]
    GO
ALTER TABLE [dbo].[asb_proposalsVoting]  WITH CHECK ADD CHECK  (([vote]='abstain' OR [vote]='no' OR [vote]='yes'))
    GO
ALTER TABLE [dbo].[emp_employeePersonalInfo]  WITH CHECK ADD CHECK  (([bloodType]='AB-' OR [bloodType]='O-' OR [bloodType]='B-' OR [bloodType]='A-' OR [bloodType]='AB+' OR [bloodType]='O+' OR [bloodType]='B+' OR [bloodType]='A+'))
    GO
ALTER TABLE [dbo].[grl_persons]  WITH CHECK ADD  CONSTRAINT [CK__persons__gender__52E34C9D] CHECK  (([gender]='female' OR [gender]='male'))
    GO
ALTER TABLE [dbo].[grl_persons] CHECK CONSTRAINT [CK__persons__gender__52E34C9D]
    GO
ALTER TABLE [dbo].[grl_persons]  WITH CHECK ADD  CONSTRAINT [CK_persons_personType] CHECK  (([personType]='Natural' OR [personType]='Jurídica'))
    GO
ALTER TABLE [dbo].[grl_persons] CHECK CONSTRAINT [CK_persons_personType]
    GO
