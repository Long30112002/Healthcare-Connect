--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid,
    schedule_id uuid NOT NULL,
    appointment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    symptoms text,
    is_paid boolean DEFAULT false,
    is_rescheduled boolean DEFAULT false,
    cancel_reason text,
    check_in_time timestamp without time zone,
    room_id uuid,
    patient_name character varying(255),
    patient_phone character varying(20),
    booking_type character varying(20) DEFAULT 'ONLINE'::character varying,
    doctor_id uuid,
    hospital_id uuid,
    CONSTRAINT check_booking_type_valid CHECK (((booking_type)::text = ANY ((ARRAY['ONLINE'::character varying, 'WALK_IN'::character varying])::text[]))),
    CONSTRAINT check_walk_in_has_name_phone CHECK ((((booking_type)::text = 'ONLINE'::text) OR (((booking_type)::text = 'WALK_IN'::text) AND (patient_name IS NOT NULL) AND (patient_phone IS NOT NULL)))),
    CONSTRAINT check_walk_in_patient_id_null CHECK ((((booking_type)::text = 'ONLINE'::text) OR (((booking_type)::text = 'WALK_IN'::text) AND (patient_id IS NULL))))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: COLUMN appointments.appointment_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.appointment_date IS 'Ng├áy kh├ím thß╗▒c tß║┐ (lß║Ñy tß╗½ schedule.date)';


--
-- Name: COLUMN appointments.patient_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.patient_name IS 'T├¬n bß╗çnh nh├ón (cho walk-in)';


--
-- Name: COLUMN appointments.patient_phone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.patient_phone IS 'S─ÉT bß╗çnh nh├ón (cho walk-in)';


--
-- Name: COLUMN appointments.booking_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.booking_type IS 'ONLINE hoß║╖c WALK_IN';


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    code character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    hospital_id uuid
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: doctor_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_history (
    id bigint NOT NULL,
    doctor_id uuid NOT NULL,
    actor_id uuid NOT NULL,
    actor_role character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    old_status character varying(50),
    new_status character varying(50),
    changes jsonb,
    rejection_reason character varying(255),
    rejection_note text,
    ip_address character varying(45),
    user_agent text,
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.doctor_history OWNER TO postgres;

--
-- Name: doctor_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_history_id_seq OWNER TO postgres;

--
-- Name: doctor_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_history_id_seq OWNED BY public.doctor_history.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    doctor_code character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    department_id uuid NOT NULL,
    specialty_id uuid NOT NULL,
    degree character varying(100),
    experience character varying(255),
    consultation_fee numeric(15,2),
    status character varying(50) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rejection_reason character varying(255),
    rejection_note text,
    cv_url character varying(255),
    biography text,
    experience_years integer,
    hospital_id uuid
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: hospital_working_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospital_working_hours (
    id uuid NOT NULL,
    hospital_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    lunch_start time without time zone,
    lunch_end time without time zone,
    min_slot_minutes integer DEFAULT 15,
    max_slot_minutes integer DEFAULT 120,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.hospital_working_hours OWNER TO postgres;

--
-- Name: hospitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    description text,
    image_url character varying(255),
    hotline character varying(20),
    manager_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'PENDING_CONFIRMATION'::character varying,
    invitation_token character varying(255),
    token_expiry timestamp without time zone,
    temp_manager_email character varying(255),
    email character varying(255),
    website character varying(255)
);


ALTER TABLE public.hospitals OWNER TO postgres;

--
-- Name: COLUMN hospitals.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hospitals.email IS 'Email li├¬n hß╗ç cß╗ºa bß╗çnh viß╗çn';


--
-- Name: COLUMN hospitals.website; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hospitals.website IS 'Website cß╗ºa bß╗çnh viß╗çn';


--
-- Name: invalidated_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invalidated_token (
    id character varying(255) NOT NULL,
    expiry_time timestamp without time zone NOT NULL
);


ALTER TABLE public.invalidated_token OWNER TO postgres;

--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    patient_id uuid,
    doctor_id uuid NOT NULL,
    hospital_id uuid NOT NULL,
    diagnosis text NOT NULL,
    symptoms text,
    notes text,
    vital_signs jsonb,
    follow_up_date date,
    status character varying(50) DEFAULT 'ACTIVE'::character varying,
    deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- Name: TABLE medical_records; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.medical_records IS 'Hß╗ô s╞í bß╗çnh ├ín ─æiß╗çn tß╗¡';


--
-- Name: COLUMN medical_records.vital_signs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.vital_signs IS 'Dß║Ñu hiß╗çu sinh tß╗ôn dß║íng JSON (huyß║┐t ├íp, nhß╗ïp tim, nhiß╗çt ─æß╗Ö, c├ón nß║╖ng, chiß╗üu cao)';


--
-- Name: COLUMN medical_records.follow_up_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.follow_up_date IS 'Ng├áy t├íi kh├ím dß╗▒ kiß║┐n';


--
-- Name: COLUMN medical_records.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.status IS 'Trß║íng th├íi bß╗çnh ├ín: ACTIVE, COMPLETED, ARCHIVED, CANCELLED';


--
-- Name: COLUMN medical_records.deleted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.deleted IS '─É├ính dß║Ñu ─æ├ú x├│a mß╗üm';


--
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    active_ingredient text,
    category character varying(50),
    dosage_form character varying(50),
    unit character varying(50),
    price numeric(19,2),
    stock_quantity integer DEFAULT 0,
    min_stock integer DEFAULT 10,
    max_stock integer,
    expiry_date date,
    manufacturer character varying(255),
    manufacturer_country character varying(100),
    requires_prescription boolean DEFAULT true,
    contraindications text,
    side_effects text,
    description text,
    usage_instructions text,
    hospital_id uuid,
    deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- Name: TABLE medicines; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.medicines IS 'Danh mß╗Ñc thuß╗æc cß╗ºa bß╗çnh viß╗çn';


--
-- Name: COLUMN medicines.active_ingredient; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.active_ingredient IS 'Hoß║ít chß║Ñt ch├¡nh cß╗ºa thuß╗æc';


--
-- Name: COLUMN medicines.dosage_form; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.dosage_form IS 'Dß║íng b├áo chß║┐: vi├¬n n├⌐n, siro, ti├¬m...';


--
-- Name: COLUMN medicines.min_stock; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.min_stock IS 'Ng╞░ß╗íng cß║únh b├ío tß╗ôn kho tß╗æi thiß╗âu';


--
-- Name: COLUMN medicines.max_stock; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.max_stock IS 'Ng╞░ß╗íng tß╗ôn kho tß╗æi ─æa';


--
-- Name: COLUMN medicines.expiry_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.expiry_date IS 'Hß║ín sß╗¡ dß╗Ñng cß╗ºa thuß╗æc';


--
-- Name: COLUMN medicines.requires_prescription; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.requires_prescription IS 'C├│ cß║ºn k├¬ ─æ╞ín kh├┤ng';


--
-- Name: COLUMN medicines.contraindications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.contraindications IS 'Chß╗æng chß╗ë ─æß╗ïnh';


--
-- Name: COLUMN medicines.side_effects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medicines.side_effects IS 'T├íc dß╗Ñng phß╗Ñ';


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    amount numeric(19,2) NOT NULL,
    payment_method character varying(20) NOT NULL,
    transaction_no character varying(100),
    status character varying(20) NOT NULL,
    refund_amount numeric(19,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hospital_id uuid,
    doctor_id uuid
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    quantity integer NOT NULL,
    dosage character varying(100),
    frequency character varying(100),
    duration integer,
    instructions text,
    unit_price numeric(19,2),
    total_price numeric(19,2),
    version bigint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: TABLE prescription_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.prescription_items IS 'Chi tiß║┐t c├íc loß║íi thuß╗æc trong ─æ╞ín';


--
-- Name: COLUMN prescription_items.dosage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_items.dosage IS 'Liß╗üu d├╣ng mß╗ùi lß║ºn';


--
-- Name: COLUMN prescription_items.frequency; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_items.frequency IS 'Tß║ºn suß║Ñt d├╣ng thuß╗æc';


--
-- Name: COLUMN prescription_items.duration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_items.duration IS 'Sß╗æ ng├áy d├╣ng thuß╗æc';


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    medical_record_id uuid NOT NULL,
    prescription_date date DEFAULT CURRENT_DATE NOT NULL,
    note text,
    total_amount numeric(19,2),
    status character varying(50) DEFAULT 'ACTIVE'::character varying,
    valid_until date,
    version bigint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hospital_id uuid,
    doctor_id uuid,
    patient_id uuid,
    created_by uuid
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: TABLE prescriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.prescriptions IS '─É╞ín thuß╗æc';


--
-- Name: COLUMN prescriptions.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescriptions.status IS 'Trß║íng th├íi ─æ╞ín thuß╗æc: ACTIVE, COMPLETED, EXPIRED, CANCELLED';


--
-- Name: COLUMN prescriptions.valid_until; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescriptions.valid_until IS '─É╞ín thuß╗æc c├│ hiß╗çu lß╗▒c ─æß║┐n ng├áy';


--
-- Name: receptionist_activity_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receptionist_activity_history (
    id bigint NOT NULL,
    receptionist_id uuid NOT NULL,
    hospital_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    appointment_id uuid,
    payment_id uuid,
    target_user_id uuid,
    target_patient_name character varying(255),
    target_patient_phone character varying(20),
    changes jsonb,
    ip_address character varying(50),
    user_agent text,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.receptionist_activity_history OWNER TO postgres;

--
-- Name: TABLE receptionist_activity_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receptionist_activity_history IS 'Lß╗ïch sß╗¡ hoß║ít ─æß╗Öng nghiß╗çp vß╗Ñ cß╗ºa lß╗à t├ón';


--
-- Name: COLUMN receptionist_activity_history.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptionist_activity_history.action IS 'CREATE_WALK_IN, CHECK_IN, REFUND, CANCEL_APPOINTMENT';


--
-- Name: receptionist_activity_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receptionist_activity_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receptionist_activity_history_id_seq OWNER TO postgres;

--
-- Name: receptionist_activity_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receptionist_activity_history_id_seq OWNED BY public.receptionist_activity_history.id;


--
-- Name: receptionist_application_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receptionist_application_history (
    id bigint NOT NULL,
    receptionist_id uuid NOT NULL,
    actor_id uuid,
    actor_role character varying(50),
    action character varying(50) NOT NULL,
    old_status character varying(50),
    new_status character varying(50),
    rejection_reason character varying(255),
    rejection_note text,
    changes jsonb,
    note text,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.receptionist_application_history OWNER TO postgres;

--
-- Name: TABLE receptionist_application_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receptionist_application_history IS 'Lß╗ïch sß╗¡ xin viß╗çc v├á duyß╗çt hß╗ô s╞í lß╗à t├ón';


--
-- Name: COLUMN receptionist_application_history.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptionist_application_history.action IS 'SUBMIT, ADMIN_VERIFY, MANAGER_APPROVE, REJECT';


--
-- Name: receptionist_application_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receptionist_application_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receptionist_application_history_id_seq OWNER TO postgres;

--
-- Name: receptionist_application_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receptionist_application_history_id_seq OWNED BY public.receptionist_application_history.id;


--
-- Name: receptionists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receptionists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    hospital_id uuid NOT NULL,
    receptionist_code character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    rejection_reason character varying(255),
    rejection_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cv_url character varying(500)
);


ALTER TABLE public.receptionists OWNER TO postgres;

--
-- Name: TABLE receptionists; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receptionists IS 'Th├┤ng tin nh├ón vi├¬n lß╗à t├ón';


--
-- Name: COLUMN receptionists.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptionists.status IS 'PENDING, VERIFIED, APPROVED, REJECTED, INACTIVE';


--
-- Name: COLUMN receptionists.cv_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receptionists.cv_url IS '─É╞░ß╗¥ng dß║½n file CV l╞░u tr├¬n Cloudinary';


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    is_anonymous boolean DEFAULT false,
    is_edited boolean DEFAULT false,
    edited_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted boolean DEFAULT false,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_number character varying(10) NOT NULL,
    floor integer,
    building character varying(50),
    status character varying(20) DEFAULT 'AVAILABLE'::character varying,
    current_appointment_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false,
    hospital_id uuid
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    doctor_id uuid NOT NULL,
    date timestamp without time zone NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    max_patients integer DEFAULT 1 NOT NULL,
    current_bookings integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    price numeric(19,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    room_id uuid
);


ALTER TABLE public.schedules OWNER TO postgres;

--
-- Name: specialties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    department_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    code character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    hospital_id uuid
);


ALTER TABLE public.specialties OWNER TO postgres;

--
-- Name: system_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_key character varying(255) NOT NULL,
    config_value text,
    config_type character varying(50) DEFAULT 'TEXT'::character varying,
    group_name character varying(100) DEFAULT 'GENERAL'::character varying,
    display_name character varying(255),
    description character varying(500),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by uuid
);


ALTER TABLE public.system_configs OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verification_code character varying(255),
    verification_expiry timestamp without time zone,
    is_enabled boolean DEFAULT false,
    lock_reason text,
    locked_at timestamp without time zone,
    locked_by uuid,
    unlocked_at timestamp without time zone,
    unlocked_by uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.lock_reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.lock_reason IS 'L├╜ do kh├│a t├ái khoß║ún';


--
-- Name: COLUMN users.locked_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.locked_at IS 'Thß╗¥i ─æiß╗âm t├ái khoß║ún bß╗ï kh├│a';


--
-- Name: COLUMN users.locked_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.locked_by IS 'ID cß╗ºa Admin ─æ├ú thß╗▒c hiß╗çn kh├│a t├ái khoß║ún';


--
-- Name: COLUMN users.unlocked_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.unlocked_at IS 'Thß╗¥i ─æiß╗âm t├ái khoß║ún ─æ╞░ß╗úc mß╗ƒ kh├│a';


--
-- Name: COLUMN users.unlocked_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.unlocked_by IS 'ID cß╗ºa Admin ─æ├ú thß╗▒c hiß╗çn mß╗ƒ kh├│a t├ái khoß║ún';


--
-- Name: doctor_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_history ALTER COLUMN id SET DEFAULT nextval('public.doctor_history_id_seq'::regclass);


--
-- Name: receptionist_activity_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history ALTER COLUMN id SET DEFAULT nextval('public.receptionist_activity_history_id_seq'::regclass);


--
-- Name: receptionist_application_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_application_history ALTER COLUMN id SET DEFAULT nextval('public.receptionist_application_history_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, patient_id, schedule_id, appointment_date, status, symptoms, is_paid, is_rescheduled, cancel_reason, check_in_time, room_id, patient_name, patient_phone, booking_type, doctor_id, hospital_id) FROM stdin;
43537240-63ca-4f07-be29-06ea3a115615	11111111-1111-1111-1111-111111111111	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-02-05 02:22:07.970875	COMPLETED	Sß╗æt, ho, mß╗çt mß╗Åi	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
e77af524-989d-4a86-90fe-82d5820bfe76	22222222-2222-2222-2222-222222222222	22222222-aaaa-aaaa-aaaa-aaaaaaaa2222	2026-03-07 02:22:07.970875	COMPLETED	─Éau ─æß║ºu, ch├│ng mß║╖t	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
05cdb993-3469-48ac-b596-da762edf31d0	33333333-3333-3333-3333-333333333333	33333333-aaaa-aaaa-aaaa-aaaaaaaa3333	2026-04-06 02:22:07.970875	COMPLETED	─Éau bß╗Ñng, buß╗ôn n├┤n	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
a1e52a1e-3f98-4e82-bff0-e9848c89013d	44444444-4444-4444-4444-444444444444	44444444-aaaa-aaaa-aaaa-aaaaaaaa4444	2026-02-15 02:22:07.970875	COMPLETED	Kh├│ thß╗ƒ, tß╗⌐c ngß╗▒c	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
731ffe65-9909-43ee-948c-aab7d20265a8	55555555-5555-5555-5555-555555555555	55555555-aaaa-aaaa-aaaa-aaaaaaaa5555	2026-03-17 02:22:07.970875	COMPLETED	Ho khan, sß╗æt nhß║╣	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
926c1dc8-208e-45bd-8f52-d837674057de	11111111-1111-1111-1111-111111111111	66666666-aaaa-aaaa-aaaa-aaaaaaaa6666	2026-04-16 02:22:07.970875	COMPLETED	─Éau hß╗ìng, nuß╗æt ─æau	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
c371c0ff-643e-4ccd-9ac7-0830392411a4	11111111-1111-1111-1111-111111111111	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-06 02:34:10.785214	COMPLETED	Test symptom	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
880e5f6c-9177-46da-bf43-b805d82e320b	11111111-1111-1111-1111-111111111111	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-01 02:44:27.944991	COMPLETED	Test bß╗çnh nh├ón ─æ├ú kh├ím xong	t	f	\N	\N	\N	\N	\N	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
940e477a-b7a5-4cb4-b257-51a384e827a0	11111111-1111-1111-1111-111111111111	1e948422-78ee-4525-90f1-546129678c5a	2026-05-08 00:00:00	CONFIRMED	Test muahahhahaha	t	f	\N	\N	\N	Nguyß╗àn V─ân An Ngu	0901234567	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
beb978be-c670-42ea-b5f3-8a200b96d501	11111111-1111-1111-1111-111111111111	78ef0ff7-6ce3-4d31-a826-adef1cb4893b	2026-05-10 00:00:00	CONFIRMED		t	f	\N	\N	3b597082-2509-4046-ac8c-cbdea1a263fc	Nguyß╗àn V─ân An Ngu	0901234567	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
0a9e1ada-9fe2-4d73-8ab5-57dfb0e70996	11111111-1111-1111-1111-111111111111	4da36908-f4ec-4c27-8f71-2917e0ac6eaa	2026-05-13 00:00:00	CANCELLED	BUON E	t	f		\N	3b597082-2509-4046-ac8c-cbdea1a263fc	Nguyß╗àn V─ân An Ngu	0901234567	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
8a18ecc5-07b7-463e-af75-037c100bf82a	\N	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-11 10:05:55.54307	COMPLETED	Triß╗çu chß╗⌐ng test	t	f	\N	\N	\N	Bß╗çnh nh├ón test 1	09800000001	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
9d793847-35c2-40ab-95eb-e04d53308425	\N	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-10 10:05:55.54307	COMPLETED	Triß╗çu chß╗⌐ng test	t	f	\N	\N	\N	Bß╗çnh nh├ón test 2	09800000002	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
4a886d0a-3a00-4914-82b3-9c8924a9dbc8	\N	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-09 10:05:55.54307	COMPLETED	Triß╗çu chß╗⌐ng test	t	f	\N	\N	\N	Bß╗çnh nh├ón test 3	09800000003	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
464f7802-2cf8-431e-ae47-9ba8bd497ec0	\N	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-08 10:05:55.54307	COMPLETED	Triß╗çu chß╗⌐ng test	t	f	\N	\N	\N	Bß╗çnh nh├ón test 4	09800000004	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
3c3a57ce-74cc-4485-a52a-2ef6ae35e74e	\N	11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	2026-05-07 10:05:55.54307	COMPLETED	Triß╗çu chß╗⌐ng test	t	f	\N	\N	\N	Bß╗çnh nh├ón test 5	09800000005	ONLINE	dddddddd-dddd-dddd-dddd-dddddddddddd	86025814-e278-4563-9c22-5b02bef5ad78
e97bdffb-d059-4f25-a433-2e9ea5320abf	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-01-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 1	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 1 ng├áy 5	0900000105	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
c79db8d4-16b8-4d27-809e-08e320eaed88	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-01-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 1	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 1 ng├áy 15	0900000115	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
3c5c9dee-74f8-405d-beae-4947ca6981b4	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-01-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 1	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 1 ng├áy 25	0900000125	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
e81002f1-c249-4a84-9f66-c1f27608e8b4	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-02-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 2	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 2 ng├áy 5	0900000205	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
3bf8e0c3-6a78-48c6-934e-b095445b9188	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-02-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 2	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 2 ng├áy 15	0900000215	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
a24c58dc-6203-47aa-a6d6-7ecd6fcc973b	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-02-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 2	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 2 ng├áy 25	0900000225	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
7aebc99f-a69f-433a-a861-7d79da87a4ff	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-03-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 3	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 3 ng├áy 5	0900000305	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
1576e490-7c17-4566-a2ce-353b84fd7b1e	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-03-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 3	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 3 ng├áy 15	0900000315	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
39b26102-2558-41c2-a92b-d506038924fc	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-03-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 3	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 3 ng├áy 25	0900000325	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
1947fb39-6d9c-420b-866b-ce82ed9f04ae	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-04-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 4	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 4 ng├áy 5	0900000405	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
7854e30b-0622-489c-b721-7ec7d04e0933	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-04-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 4	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 4 ng├áy 15	0900000415	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
692d6092-2cd8-4eb6-b354-398de08cceb2	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-04-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 4	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 4 ng├áy 25	0900000425	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
21678922-6b3c-4ee8-a696-4a3d2774b72e	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 5	0900000505	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
b984d69a-7859-4597-b034-a08025c8ab9f	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 15	0900000515	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
31f14659-b474-4414-8fc1-9061bd218dd0	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 25	0900000525	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
8e30589b-639d-495a-b16b-a6956fdba1fa	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-06-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 6	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 6 ng├áy 5	0900000605	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
9a14172f-09e7-4ef3-a437-e90ddc362173	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-06-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 6	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 6 ng├áy 15	0900000615	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
a966fc5f-1bef-471f-96b2-8bc5c40455d4	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-06-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 6	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 6 ng├áy 25	0900000625	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
926f572b-882d-4955-9b1b-99f76b9740ff	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-07-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 7	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 7 ng├áy 5	0900000705	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
c6528983-5a51-4b2d-951f-3d291c082721	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-07-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 7	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 7 ng├áy 15	0900000715	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
047c0648-f983-4b15-b155-fa0b8815a707	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-07-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 7	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 7 ng├áy 25	0900000725	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
df717697-45da-4ab8-9e83-a3c6ce540c05	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-08-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 8	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 8 ng├áy 5	0900000805	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
4a451548-9c38-458c-8a9c-133cf15b569a	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-08-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 8	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 8 ng├áy 15	0900000815	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
a815e3d8-6318-4e10-adeb-78158fac55aa	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-08-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 8	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 8 ng├áy 25	0900000825	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
a56eccc7-d7b7-4371-92dd-b0cf94622520	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-09-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 9	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 9 ng├áy 5	0900000905	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
5c6a0730-d4f1-4013-88d0-051e85becb3e	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-09-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 9	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 9 ng├áy 15	0900000915	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
499987db-dd33-4720-a95f-85a5bef66cd6	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-09-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 9	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 9 ng├áy 25	0900000925	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
00df8ad4-eb8f-4710-89ae-75ba94ff37f4	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-10-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 10	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 10 ng├áy 5	0900001005	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
ebe8edc6-d2a0-493c-911e-f628eb4a1298	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-10-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 10	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 10 ng├áy 15	0900001015	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
5425dc50-d877-4ac4-86e3-e2ca301df146	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-10-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 10	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 10 ng├áy 25	0900001025	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
4c15c28b-4a0d-4652-a3a9-94fdf4df9be9	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-11-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 11	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 11 ng├áy 5	0900001105	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
39b229c4-2636-4b7a-a375-ab04b4e47450	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-11-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 11	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 11 ng├áy 15	0900001115	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
f49fcb34-f1bc-4891-af39-3a9213de1bf5	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-11-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 11	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 11 ng├áy 25	0900001125	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
6dfb4c58-f561-4d17-8a97-b9c04dd0cf89	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-12-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 12	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 12 ng├áy 5	0900001205	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
15fda48b-1afa-4f18-ba44-034625ec3a94	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-12-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 12	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 12 ng├áy 15	0900001215	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
75a0b20c-e5cf-4d59-975c-31abf8210f8c	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-12-25 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 12	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 12 ng├áy 25	0900001225	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
2aa78e2b-4349-45c9-9b64-c8f8632c7899	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-01 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 1	0900000501	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
30cba42a-4cca-4936-856e-9a89af47f40b	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-02 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 2	0900000502	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
68230621-1e6a-4926-aed7-b751b75db437	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-03 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 3	0900000503	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
5486ec61-8d0e-46d9-93d0-a2d6031955b4	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-04 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 4	0900000504	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
950ac655-e7b1-48f8-af45-9300652172a9	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-05 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 5	0900000505	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
ea23b3ad-245a-4459-bc9e-f2937ee638fb	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-06 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 6	0900000506	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
3e53c2a3-8f70-42e3-b88b-01190a5638bf	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-07 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 7	0900000507	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
de3f75a6-cf9b-4754-a255-85225aa6eacd	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-08 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 8	0900000508	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
93f3aebe-1388-4705-9708-b6be1c044894	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-09 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 9	0900000509	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
2d5b98c1-eab6-40f0-9a73-ca82ba9d38a2	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-10 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 10	0900000510	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
c17c64c9-87a0-4bad-aff6-b44cbd89b747	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-11 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 11	0900000511	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
fc5147ea-365f-4d76-a3fd-6f1888e39d14	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-12 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 12	0900000512	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
08d692ad-2e96-428d-bd19-eb423d9450dd	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-13 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 13	0900000513	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
bfe39d59-8d87-4596-9201-a11f2cb8b794	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-14 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 14	0900000514	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
3b62fb37-904b-4c67-ac9f-407488ff18ef	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-15 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 15	0900000515	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
c5f0321b-7cec-4d12-95f5-c87032b7735c	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-16 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 16	0900000516	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
c9d1c80d-feec-4438-afa0-8aed33eb6d60	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-17 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 17	0900000517	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
1acdd5b7-f898-4933-bb12-ed17228d0380	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-18 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 18	0900000518	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
690bd30c-fd62-4a9d-be48-79215782f9ba	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-19 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 19	0900000519	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
953f7bf1-8c55-47ee-ba88-2388d0819cea	\N	6bb91b65-8af9-4ae8-be96-23a6ec8ac798	2026-05-20 10:00:00	COMPLETED	Triß╗çu chß╗⌐ng test th├íng 5	t	f	\N	\N	\N	Bß╗çnh nh├ón th├íng 5 ng├áy 20	0900000520	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
0632e5c3-1fd2-40d3-a5fa-47bf6ea99b45	11111111-1111-1111-1111-111111111111	c58333ed-0c67-48e8-a34b-597aaf344843	2026-06-01 00:00:00	IN_PROGRESS		t	f	\N	2026-06-01 01:33:34.058432	3b597082-2509-4046-ac8c-cbdea1a263fc	Nguyß╗àn V─ân An Ngu	0901234567	ONLINE	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
197e91ba-5d56-4c90-b0a1-9562e78241db	\N	3d47ae86-8c4c-4090-b1ba-e499d3986a6e	2026-06-02 00:00:00	CANCELLED	hghghghg	t	f	WRONG_APPOINTMENT	\N	\N	cccccc	0983723742	WALK_IN	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
1ceb6d2d-24e6-49ef-9457-3ef81592e59a	\N	3d47ae86-8c4c-4090-b1ba-e499d3986a6e	2026-06-02 00:00:00	CANCELLED		t	f	DOCTOR_UNAVAILABLE	\N	\N	kokkook	0989898997	WALK_IN	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	86025814-e278-4563-9c22-5b02bef5ad78
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, description, created_at, updated_at, code, category, hospital_id) FROM stdin;
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	Nß╗Öi tß╗òng hß╗úp	Khoa Nß╗Öi tß╗òng hß╗úp	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	KNOI	INTERNAL_MEDICINE	86025814-e278-4563-9c22-5b02bef5ad78
e3b22055-7c7d-47b0-bee8-ee2b6b3f0058	X├⌐t Nghiß╗çm Nß╗Öi Tß║íng	X├⌐t nghiß╗çm nß╗Öi tß║íng c├íc thß╗⌐, ...	2026-05-13 18:43:04.831744	2026-05-13 18:43:04.831744	XNNT	LABORATORY	86025814-e278-4563-9c22-5b02bef5ad78
\.


--
-- Data for Name: doctor_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor_history (id, doctor_id, actor_id, actor_role, action, old_status, new_status, changes, rejection_reason, rejection_note, ip_address, user_agent, note, created_at) FROM stdin;
66	08dd92a9-ff49-48fc-b51a-16487e471532	289c1f58-5533-43ee-b712-d22ac4d38e68	DOCTOR	CREATE	\N	PENDING	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Nß╗Öp hß╗ô s╞í ─æ─âng k├╜ b├íc s─⌐ lß║ºn ─æß║ºu	2026-05-29 01:15:03.579336
67	08dd92a9-ff49-48fc-b51a-16487e471532	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	ADMIN	REJECT	PENDING	REJECTED	\N	OTHER		0:0:0:0:0:0:0:1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	Admin tß╗½ chß╗æi hß╗ô s╞í	2026-05-29 02:30:56.520773
68	08dd92a9-ff49-48fc-b51a-16487e471532	289c1f58-5533-43ee-b712-d22ac4d38e68	DOCTOR	REAPPLY	REJECTED	PENDING	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	Gß╗¡i lß║íi hß╗ô s╞í sau khi bß╗ï tß╗½ chß╗æi	2026-05-29 02:32:00.941099
69	08dd92a9-ff49-48fc-b51a-16487e471532	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	ADMIN	VERIFY	PENDING	VERIFIED	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	Admin x├íc thß╗▒c hß╗ô s╞í b├íc s─⌐	2026-05-29 02:37:54.454605
70	08dd92a9-ff49-48fc-b51a-16487e471532	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	ADMIN	REJECT	PENDING	REJECTED	\N	PROFILE_MISMATCH	Th├┤ng tin c├í nh├ón kh├┤ng khß╗¢p vß╗¢i bß║▒ng cß║Ñp	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Admin tß╗½ chß╗æi hß╗ô s╞í	2026-05-29 03:41:24.56111
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, doctor_code, user_id, department_id, specialty_id, degree, experience, consultation_fee, status, created_at, updated_at, rejection_reason, rejection_note, cv_url, biography, experience_years, hospital_id) FROM stdin;
dddddddd-dddd-dddd-dddd-dddddddddddd	DOC001	66666666-6666-6666-6666-666666666666	bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	cccccccc-cccc-cccc-cccc-cccccccccccc	Tiß║┐n s─⌐, B├íc s─⌐ CKII	\N	500000.00	APPROVED	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N	\N	http://localhost:9000/healthcare-cvs/doctor_cvs/c947dc2f-0afe-478d-996a-bc277d9b06c1.pdf	Chuy├¬n gia tim mß║ích	12	86025814-e278-4563-9c22-5b02bef5ad78
aa8f6898-272d-41e4-aaaa-b58cdbba87d3	DOC-2026-1445CB52	c75b68f7-05b1-45ed-ae68-f7042080c1d1	bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	cccccccc-cccc-cccc-cccc-cccccccccccc	Thß║íc s─⌐ ─æß║╣p trai nhß║Ñt thß║┐ giß╗¢i	\N	\N	APPROVED	2026-05-06 16:17:18.790599	2026-05-06 18:26:53.021895	\N	\N	http://localhost:9000/healthcare-cvs/doctor_cvs/c947dc2f-0afe-478d-996a-bc277d9b06c1.pdf	L├á mß╗Öt ng╞░ß╗¥i cß╗▒c k├¼ ─æß║╣p trai	7	86025814-e278-4563-9c22-5b02bef5ad78
08dd92a9-ff49-48fc-b51a-16487e471532	DOC-2026-D63B5C41	289c1f58-5533-43ee-b712-d22ac4d38e68	e3b22055-7c7d-47b0-bee8-ee2b6b3f0058	7d413c58-18e6-442b-8d81-79dd17fe90ba	fafaafaf	\N	\N	REJECTED	2026-05-29 01:15:03.587236	2026-05-29 03:41:24.620878	PROFILE_MISMATCH	Th├┤ng tin c├í nh├ón kh├┤ng khß╗¢p vß╗¢i bß║▒ng cß║Ñp	http://localhost:9000/healthcare-cvs/doctor_cvs/c947dc2f-0afe-478d-996a-bc277d9b06c1.pdf	nvmvmvmvmvm	12	86025814-e278-4563-9c22-5b02bef5ad78
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	initial setup	SQL	V1__initial_setup.sql	1191644301	postgres	2026-04-06 02:16:46.949175	154	t
2	2	add auth fields to users	SQL	V2__add_auth_fields_to_users.sql	665469259	postgres	2026-04-06 02:16:47.195979	4	t
3	3	create invalidated token table	SQL	V3__create_invalidated_token_table.sql	207652581	postgres	2026-04-06 02:16:47.215571	8	t
4	4	create specialties table	SQL	V4__create_specialties_table.sql	761379721	postgres	2026-04-06 02:16:47.235176	33	t
5	5	add code to departments and specialties	SQL	V5__add_code_to_departments_and_specialties.sql	1985567900	postgres	2026-04-06 02:16:47.280315	69	t
6	6	add category to departments and specialties	SQL	V6__add_category_to_departments_and_specialties.sql	-367019434	postgres	2026-04-06 02:16:47.369335	49	t
7	7	change user id to uuid	SQL	V7__change_user_id_to_uuid.sql	-244542113	postgres	2026-04-06 02:16:47.430267	46	t
8	8	add rejection columns to doctors	SQL	V8__add_rejection_columns_to_doctors.sql	1984011356	postgres	2026-04-06 02:16:47.491018	3	t
9	9	update doctor profile and cv	SQL	V9__update_doctor_profile_and_cv.sql	-1519838878	postgres	2026-04-06 02:16:47.502794	48	t
10	10	create hospitals table	SQL	V10__create_hospitals_table.sql	1198035202	postgres	2026-04-06 02:16:47.563545	26	t
11	11	add fk manager id to hospital	SQL	V11__add_fk_manager_id_to_hospital.sql	-513846331	postgres	2026-04-06 02:16:47.598764	7	t
12	13	create booking and schedule tables	SQL	V13__create_booking_and_schedule_tables.sql	-1554070062	postgres	2026-04-06 02:16:47.614932	40	t
13	14	add invitation fields to hospitals	SQL	V14__add_invitation_fields_to_hospitals.sql	1997235096	postgres	2026-04-06 02:16:47.668335	4	t
14	15	add missing fields to hospitals	SQL	V15__add_missing_fields_to_hospitals.sql	1601683509	postgres	2026-04-06 02:16:47.680608	5	t
15	16	Create Payment And Update Appointment	SQL	V16__Create_Payment_And_Update_Appointment.sql	-1564849078	postgres	2026-04-06 02:16:47.696326	29	t
16	17	Update Schedule Time Type	SQL	V17__Update_Schedule_Time_Type.sql	619338834	postgres	2026-04-06 02:16:47.736201	74	t
17	18	Update Schedule Price To BigDecimal	SQL	V18__Update_Schedule_Price_To_BigDecimal.sql	376115182	postgres	2026-04-06 02:16:47.822995	1	t
18	19	Create Doctor Apply History	SQL	V19__Create_Doctor_Apply_History.sql	-1329625793	postgres	2026-04-06 21:54:22.62346	211	t
19	20	fix doctor history ip address	SQL	V20__fix_doctor_history_ip_address.sql	630720974	postgres	2026-04-07 01:11:41.384143	1373	t
20	21	create rooms table	SQL	V21__create_rooms_table.sql	-347546439	postgres	2026-04-14 00:30:23.827753	141	t
21	22	add room id to schedules	SQL	V22__add_room_id_to_schedules.sql	629190099	postgres	2026-04-14 00:30:24.085036	35	t
22	23	add room id to appointments	SQL	V23__add_room_id_to_appointments.sql	135958638	postgres	2026-04-14 00:30:24.130478	11	t
23	24	add deleted to rooms	SQL	V24__add_deleted_to_rooms.sql	-2025517624	postgres	2026-04-14 01:20:13.091498	96	t
24	25	add walk in fields to appointments	SQL	V25__add_walk_in_fields_to_appointments.sql	-1114372739	postgres	2026-04-17 08:20:07.568884	184	t
25	26	add refund details to payments	SQL	V26__add_refund_details_to_payments.sql	335795894	postgres	2026-04-18 11:10:27.650657	141	t
26	27	create receptionist tables	SQL	V27__create_receptionist_tables.sql	1146797574	postgres	2026-04-19 09:11:00.444543	346	t
27	28	remove refund fields from payments	SQL	V28__remove_refund_fields_from_payments.sql	-914229849	postgres	2026-04-19 09:11:00.949696	12	t
28	29	add cv url to receptionists	SQL	V29__add_cv_url_to_receptionists.sql	-2083784208	postgres	2026-04-19 10:55:06.161012	63	t
29	30	add denormalized fields	SQL	V30__add_denormalized_fields.sql	-510287801	postgres	2026-04-19 16:22:53.3209	266	t
30	31	fix appointment date to schedule date	SQL	V31__fix_appointment_date_to_schedule_date.sql	-540183476	postgres	2026-04-20 21:03:48.662546	75	t
31	32	create medical record tables	SQL	V32__create_medical_record_tables.sql	1735585547	postgres	2026-04-22 23:28:38.130283	305	t
32	33	update medicines unique code per hospital	SQL	V33__update_medicines_unique_code_per_hospital.sql	3597684	postgres	2026-04-23 15:13:17.200747	110	t
33	34	update medical record patientId dropnotnull	SQL	V34__update_medical_record_patientId_dropnotnull.sql	554543736	postgres	2026-04-23 15:55:00.337639	53	t
34	35	update medical tables	SQL	V35__update_medical_tables.sql	1200886483	postgres	2026-04-23 17:14:56.882352	685	t
35	36	update hospital	SQL	V36__update_hospital.sql	-866904457	postgres	2026-04-26 03:20:03.290139	1170	t
36	37	create table reviews	SQL	V37__create_table_reviews.sql	-1213713750	postgres	2026-04-30 20:33:26.614023	197	t
37	38	add delete table reviews	SQL	V38__add_delete_table_reviews.sql	-1904977972	postgres	2026-04-30 21:18:24.118754	50	t
38	40	insert default working hours	SQL	V40__insert_default_working_hours.sql	385279889	postgres	2026-05-06 22:43:25.444478	28	t
39	41	add hospital id to departments specialties	SQL	V41__add_hospital_id_to_departments_specialties.sql	-1271955161	postgres	2026-05-13 12:27:50.293354	196	t
40	42	create system configs table	SQL	V42__create_system_configs_table.sql	-707220685	postgres	2026-05-13 23:48:01.528939	317	t
41	43	add english config	SQL	V43__add_english_config.sql	-401898149	postgres	2026-05-14 00:25:52.490931	27	t
42	44	rename vietnamese config	SQL	V44__rename_vietnamese_config.sql	-1962446825	postgres	2026-05-14 00:25:52.671697	14	t
43	45	add lock fields to users	SQL	V45__add_lock_fields_to_users.sql	1577743610	postgres	2026-05-27 19:16:56.29428	252	t
\.


--
-- Data for Name: hospital_working_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospital_working_hours (id, hospital_id, day_of_week, start_time, end_time, lunch_start, lunch_end, min_slot_minutes, max_slot_minutes, is_active, created_at, updated_at) FROM stdin;
7b67142c-c5d6-41b2-9494-b0e9a94b7ca5	86025814-e278-4563-9c22-5b02bef5ad78	8	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	2026-05-09 00:11:44.722639	2026-05-09 00:11:44.722639
14f69020-35ec-429f-a4f0-99f292862c75	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	2	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	\N	\N
4750aa4a-c263-4e19-9543-83e98b9a9e6a	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	5	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	\N	\N
dab0e356-8111-42b5-a35c-4dfabb204e58	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	6	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	\N	\N
409c02ed-43c3-4eee-94a9-d69e4f63e1aa	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	4	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	\N	\N
75ae1b23-5ba9-4407-8c5e-e3763e148d96	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	3	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	\N	\N
351c1fcc-ffa7-48f5-87e4-6fd232ee42a0	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	7	07:30:00	12:00:00	\N	\N	15	120	t	\N	\N
104a2ae9-5112-45d3-adcb-7258895ab6b1	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	8	08:00:00	11:00:00	\N	\N	15	120	t	\N	\N
bbcad660-9d87-439a-b889-b4fad0a60353	86025814-e278-4563-9c22-5b02bef5ad78	2	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
3ce7398f-e8d0-4f86-8864-2b9c7b2a9a63	86025814-e278-4563-9c22-5b02bef5ad78	3	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
9f3eb00a-9cad-405b-86a2-1bbb1506ad58	86025814-e278-4563-9c22-5b02bef5ad78	4	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
45ca5dc6-ada7-4522-9b4d-19fcb8c1fa8c	86025814-e278-4563-9c22-5b02bef5ad78	5	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
2114374e-7288-49b2-912f-5a6d77315f4f	86025814-e278-4563-9c22-5b02bef5ad78	6	07:30:00	17:00:00	12:00:00	13:30:00	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
27d560e6-b57b-4ba6-80b7-1f654a763207	86025814-e278-4563-9c22-5b02bef5ad78	7	07:30:00	12:00:00	\N	\N	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
061a7c4b-5f6e-4ba4-a1c3-ad9a5a999e54	86025814-e278-4563-9c22-5b02bef5ad78	7	08:00:00	11:00:00	\N	\N	15	120	t	2026-05-09 00:07:39.497977	2026-05-09 00:07:39.497977
\.


--
-- Data for Name: hospitals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospitals (id, name, address, description, image_url, hotline, manager_id, created_at, updated_at, status, invitation_token, token_expiry, temp_manager_email, email, website) FROM stdin;
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Bß╗çnh viß╗çn ─Éa khoa Xuy├¬n ├ü	42 Cß╗æng Quß╗│nh, Quß║¡n 1, TP.HCM	Bß╗çnh viß╗çn ti├¬u chuß║⌐n quß╗æc tß║┐	https://example.com/hospital1.jpg	0281234567	\N	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	ACTIVE	\N	\N	\N	\N	\N
86025814-e278-4563-9c22-5b02bef5ad78	Bß╗çnh viß╗çn ─Éa khoa ─Éß╗ông Nai H├á Nß╗Öi	42 Cß╗æng Quß╗│nh, Quß║¡n 1, TP.HCM	Bß╗çnh viß╗çn ─Éß╗ông Nai	https://link-anh-bv.com/image.jpg	0121313414	ef05629a-152f-4294-80c0-2f644410fba8	2026-05-06 18:21:33.01436	2026-05-06 18:21:56.641632	ACTIVE	\N	\N	\N		\N
\.


--
-- Data for Name: invalidated_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invalidated_token (id, expiry_time) FROM stdin;
\.


--
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_records (id, appointment_id, patient_id, doctor_id, hospital_id, diagnosis, symptoms, notes, vital_signs, follow_up_date, status, deleted, version, created_at, updated_at, deleted_at) FROM stdin;
2e0d2f2a-9494-4e13-9c20-54f3e0631d3c	43537240-63ca-4f07-be29-06ea3a115615	11111111-1111-1111-1111-111111111111	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Cß║úm c├║m	Sß╗æt, ho, mß╗çt mß╗Åi	\N	\N	\N	COMPLETED	f	0	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N
20827ac7-0efa-4dae-82cd-35a8fb1bda52	e77af524-989d-4a86-90fe-82d5820bfe76	22222222-2222-2222-2222-222222222222	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	T─âng huyß║┐t ├íp	─Éau ─æß║ºu, ch├│ng mß║╖t	\N	\N	\N	COMPLETED	f	0	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N
079bc9a3-3195-475d-82e2-1d7316d5ff6b	05cdb993-3469-48ac-b596-da762edf31d0	33333333-3333-3333-3333-333333333333	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Vi├¬m dß║í d├áy	─Éau bß╗Ñng, buß╗ôn n├┤n	\N	\N	\N	COMPLETED	f	0	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N
6240fa21-179e-4cca-83da-7e4e310a7faf	a1e52a1e-3f98-4e82-bff0-e9848c89013d	44444444-4444-4444-4444-444444444444	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Vi├¬m phß║┐ quß║ún	Kh├│ thß╗ƒ, tß╗⌐c ngß╗▒c	\N	\N	\N	COMPLETED	f	0	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N
019afc55-18ba-4dfa-bdea-625c0fb43aa1	731ffe65-9909-43ee-948c-aab7d20265a8	55555555-5555-5555-5555-555555555555	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Vi├¬m hß╗ìng	Ho khan, sß╗æt nhß║╣	\N	\N	\N	COMPLETED	f	0	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N
db483dde-749c-40f8-ace3-554288ea74ab	926c1dc8-208e-45bd-8f52-d837674057de	11111111-1111-1111-1111-111111111111	dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Vi├¬m hß╗ìng	─Éau hß╗ìng, nuß╗æt ─æau	\N	\N	\N	COMPLETED	f	0	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	\N
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, code, name, active_ingredient, category, dosage_form, unit, price, stock_quantity, min_stock, max_stock, expiry_date, manufacturer, manufacturer_country, requires_prescription, contraindications, side_effects, description, usage_instructions, hospital_id, deleted, version, created_at, updated_at, deleted_at) FROM stdin;
c4fe668a-958c-440a-b942-bcc3629982f2	NGU-0001	kakakaka	GAGAGAGA	ANALGESIC	\N	BOX	123123.00	22	10	\N	2026-05-12	NGU	\N	t	ß╗êA 	T├ê	├ôC	G├Ç	86025814-e278-4563-9c22-5b02bef5ad78	f	0	2026-05-10 23:23:28.41049	2026-05-10 23:23:28.41049	\N
580441c2-5f5a-4d10-9557-d88c04d010b1	LONG-991	KAKAKAK	AAAAA	ANTIBIOTIC	\N	BLISTER	1012123.00	1157	10	\N	2026-05-13	bbbbbbbb	\N	t			bbbbb		86025814-e278-4563-9c22-5b02bef5ad78	f	1	2026-05-11 01:52:40.17828	2026-05-11 02:27:24.670258	\N
fd93065b-bee6-4243-b56a-37923968e66f	NGU-9912	AAKAK	KAKAKAKAK	ANALGESIC	CREAM	BOX	122222.00	10	10	1234512	2026-05-12	aa	TESST	t	aa	aa	aaccc	aa	86025814-e278-4563-9c22-5b02bef5ad78	t	7	2026-05-11 01:28:58.828963	2026-05-11 16:20:06.091132	2026-05-11 16:29:24.23416
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, appointment_id, amount, payment_method, transaction_no, status, refund_amount, created_at, updated_at, hospital_id, doctor_id) FROM stdin;
3573c82d-f5ff-4f5c-a691-b9f7b5fc91d1	940e477a-b7a5-4cb4-b257-51a384e827a0	123000.00	MOMO	4741296656	SUCCESS	\N	2026-05-07 22:58:59.562418	2026-05-07 22:58:59.549744	86025814-e278-4563-9c22-5b02bef5ad78	aa8f6898-272d-41e4-aaaa-b58cdbba87d3
5dd8ffb1-386a-4aee-a0a9-326664791026	beb978be-c670-42ea-b5f3-8a200b96d501	55555.00	MOMO	4742211610	SUCCESS	\N	2026-05-09 02:42:08.34104	2026-05-09 02:42:08.292787	86025814-e278-4563-9c22-5b02bef5ad78	dddddddd-dddd-dddd-dddd-dddddddddddd
56dcc313-7640-41b3-8753-0efbbe5fdf9d	0a9e1ada-9fe2-4d73-8ab5-57dfb0e70996	123123.00	MOMO	4744356572	REFUNDED	61561.50	2026-05-12 00:46:27.459059	2026-05-12 00:46:27.450187	86025814-e278-4563-9c22-5b02bef5ad78	dddddddd-dddd-dddd-dddd-dddddddddddd
4e6d7b7b-9dcb-424f-9ab2-f9b4d5001a89	0632e5c3-1fd2-40d3-a5fa-47bf6ea99b45	535553.00	MOMO	4754126610	SUCCESS	\N	2026-06-01 01:30:59.320604	2026-06-01 01:30:59.311914	86025814-e278-4563-9c22-5b02bef5ad78	aa8f6898-272d-41e4-aaaa-b58cdbba87d3
f807b704-a688-4dc3-8731-42c07f0ec0c9	197e91ba-5d56-4c90-b0a1-9562e78241db	111111.00	MOMO	4754127821	REFUNDED	111111.00	2026-06-01 01:34:51.921839	2026-06-01 01:34:35.351324	86025814-e278-4563-9c22-5b02bef5ad78	aa8f6898-272d-41e4-aaaa-b58cdbba87d3
734fb696-eeaf-4fdc-8ae5-2eea344bb54d	1ceb6d2d-24e6-49ef-9457-3ef81592e59a	111111.00	CASH	WALKIN_1780252543254_e073fa1a	REFUNDED	55555.50	2026-06-01 01:35:43.25444	2026-06-01 01:35:43.251336	86025814-e278-4563-9c22-5b02bef5ad78	aa8f6898-272d-41e4-aaaa-b58cdbba87d3
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_id, quantity, dosage, frequency, duration, instructions, unit_price, total_price, version, created_at) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, medical_record_id, prescription_date, note, total_amount, status, valid_until, version, created_at, updated_at, hospital_id, doctor_id, patient_id, created_by) FROM stdin;
\.


--
-- Data for Name: receptionist_activity_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptionist_activity_history (id, receptionist_id, hospital_id, action, appointment_id, payment_id, target_user_id, target_patient_name, target_patient_phone, changes, ip_address, user_agent, note, created_at) FROM stdin;
61	bf5be933-a79f-42b2-890b-a28523f9f451	86025814-e278-4563-9c22-5b02bef5ad78	CHECK_IN	0632e5c3-1fd2-40d3-a5fa-47bf6ea99b45	\N	\N	Nguyß╗àn V─ân An Ngu	0901234567	{"room_number": "123"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-01 01:33:34.072661
62	bf5be933-a79f-42b2-890b-a28523f9f451	86025814-e278-4563-9c22-5b02bef5ad78	CREATE_WALK_IN_APPOINTMENT	197e91ba-5d56-4c90-b0a1-9562e78241db	\N	\N	cccccc	0983723742	{"price": 111111.00, "doctor_name": "Ho├áng Tuß║Ñn Long", "schedule_id": "3d47ae86-8c4c-4090-b1ba-e499d3986a6e", "payment_method": "MOMO"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-01 01:34:35.561273
63	bf5be933-a79f-42b2-890b-a28523f9f451	86025814-e278-4563-9c22-5b02bef5ad78	REFUND	197e91ba-5d56-4c90-b0a1-9562e78241db	f807b704-a688-4dc3-8731-42c07f0ec0c9	\N	cccccc	0983723742	{"refund_amount": 111111.00, "refund_method": "MOMO", "refund_reason": "WRONG_APPOINTMENT"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	WRONG_APPOINTMENT	2026-06-01 01:35:19.035206
64	bf5be933-a79f-42b2-890b-a28523f9f451	86025814-e278-4563-9c22-5b02bef5ad78	CREATE_WALK_IN_APPOINTMENT	1ceb6d2d-24e6-49ef-9457-3ef81592e59a	\N	\N	kokkook	0989898997	{"price": 111111.00, "doctor_name": "Ho├áng Tuß║Ñn Long", "schedule_id": "3d47ae86-8c4c-4090-b1ba-e499d3986a6e", "payment_method": "CASH"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-01 01:35:43.261953
65	bf5be933-a79f-42b2-890b-a28523f9f451	86025814-e278-4563-9c22-5b02bef5ad78	REFUND	1ceb6d2d-24e6-49ef-9457-3ef81592e59a	734fb696-eeaf-4fdc-8ae5-2eea344bb54d	\N	kokkook	0989898997	{"refund_amount": 55555.500, "refund_method": "CASH", "refund_reason": "DOCTOR_UNAVAILABLE"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	DOCTOR_UNAVAILABLE	2026-06-01 01:35:53.219207
\.


--
-- Data for Name: receptionist_application_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptionist_application_history (id, receptionist_id, actor_id, actor_role, action, old_status, new_status, rejection_reason, rejection_note, changes, note, ip_address, user_agent, created_at) FROM stdin;
23	bf5be933-a79f-42b2-890b-a28523f9f451	659f1923-9223-45de-b27d-30c8fc881389	ROLE_PATIENT	CREATE	\N	PENDING	\N	\N	\N	Nß╗Öp hß╗ô s╞í ─æ─âng k├╜ lß╗à t├ón lß║ºn ─æß║ºu	192.168.1.6	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-05-06 18:29:05.344884
24	bf5be933-a79f-42b2-890b-a28523f9f451	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	ROLE_ADMIN	VERIFY	PENDING	VERIFIED	\N	\N	\N	Admin x├íc thß╗▒c hß╗ô s╞í lß╗à t├ón	0:0:0:0:0:0:0:1	PostmanRuntime/7.54.0	2026-05-06 18:30:02.254465
25	bf5be933-a79f-42b2-890b-a28523f9f451	ef05629a-152f-4294-80c0-2f644410fba8	ROLE_HOSPITAL_MANAGER	APPROVE	VERIFIED	APPROVED	\N	\N	\N	Manager tiß║┐p nhß║¡n lß╗à t├ón v├áo bß╗çnh viß╗çn	0:0:0:0:0:0:0:1	PostmanRuntime/7.54.0	2026-05-06 18:30:18.898531
30	6c962b89-68a3-49d3-b749-c40f7c34e209	289c1f58-5533-43ee-b712-d22ac4d38e68	ROLE_PATIENT	CREATE	\N	PENDING	\N	\N	\N	Nß╗Öp hß╗ô s╞í ─æ─âng k├╜ lß╗à t├ón lß║ºn ─æß║ºu	0:0:0:0:0:0:0:1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	2026-05-29 02:33:21.099727
31	6c962b89-68a3-49d3-b749-c40f7c34e209	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	ROLE_ADMIN	VERIFY	PENDING	VERIFIED	\N	\N	\N	Admin x├íc thß╗▒c hß╗ô s╞í lß╗à t├ón	0:0:0:0:0:0:0:1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	2026-05-29 02:35:45.689789
33	6c962b89-68a3-49d3-b749-c40f7c34e209	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	ROLE_ADMIN	REJECT	PENDING	REJECTED	INSUFFICIENT_EXPERIENCE	Kinh nghiß╗çm l├ám viß╗çc ch╞░a ─æß║ít y├¬u cß║ºu	\N	Admin tß╗½ chß╗æi hß╗ô s╞í lß╗à t├ón	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-29 03:41:00.07717
\.


--
-- Data for Name: receptionists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receptionists (id, user_id, hospital_id, receptionist_code, status, rejection_reason, rejection_note, created_at, updated_at, cv_url) FROM stdin;
6c962b89-68a3-49d3-b749-c40f7c34e209	289c1f58-5533-43ee-b712-d22ac4d38e68	86025814-e278-4563-9c22-5b02bef5ad78	REC-2026-A9DD51A2	REJECTED	INSUFFICIENT_EXPERIENCE	Kinh nghiß╗çm l├ám viß╗çc ch╞░a ─æß║ít y├¬u cß║ºu	2026-05-29 02:33:21.099726	2026-05-29 03:41:00.189425	http://localhost:9000/healthcare-cvs/doctor_cvs/3d9d914f-39e7-44e9-b000-15bff3e4aff7.pdf
bf5be933-a79f-42b2-890b-a28523f9f451	659f1923-9223-45de-b27d-30c8fc881389	86025814-e278-4563-9c22-5b02bef5ad78	REC-2026-D97AD786	APPROVED	\N	\N	2026-05-06 18:29:05.344883	2026-05-06 18:30:18.937768	http://localhost:9000/healthcare-cvs/doctor_cvs/3d9d914f-39e7-44e9-b000-15bff3e4aff7.pdf
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, appointment_id, patient_id, doctor_id, rating, comment, is_anonymous, is_edited, edited_at, created_at, deleted) FROM stdin;
b166c850-10b2-415a-9c86-1b14417ff09f	43537240-63ca-4f07-be29-06ea3a115615	11111111-1111-1111-1111-111111111111	dddddddd-dddd-dddd-dddd-dddddddddddd	5	B├íc s─⌐ kh├ím rß║Ñt tß╗æt, nhiß╗çt t├¼nh	f	f	\N	2026-05-06 02:22:07.970875	f
a802fc20-4c90-4f0f-9e15-6a425d0182e0	e77af524-989d-4a86-90fe-82d5820bfe76	22222222-2222-2222-2222-222222222222	dddddddd-dddd-dddd-dddd-dddddddddddd	4	T╞░ vß║Ñn tß╗æt, h├ái l├▓ng	f	f	\N	2026-05-06 02:22:07.970875	f
538c37d4-431e-4beb-a775-22e096ee76f2	05cdb993-3469-48ac-b596-da762edf31d0	33333333-3333-3333-3333-333333333333	dddddddd-dddd-dddd-dddd-dddddddddddd	5	Rß║Ñt h├ái l├▓ng, sß║╜ quay lß║íi	f	f	\N	2026-05-06 02:22:07.970875	f
0226546b-114e-495a-aaae-dbed2bb70d17	a1e52a1e-3f98-4e82-bff0-e9848c89013d	44444444-4444-4444-4444-444444444444	dddddddd-dddd-dddd-dddd-dddddddddddd	4	─É╞ín thuß╗æc hß╗úp l├╜, khß╗Åi nhanh	f	f	\N	2026-05-06 02:22:07.970875	f
4bf1dfe5-7581-44c1-946d-23866ada6e93	731ffe65-9909-43ee-948c-aab7d20265a8	55555555-5555-5555-5555-555555555555	dddddddd-dddd-dddd-dddd-dddddddddddd	5	B├íc s─⌐ chuy├¬n nghiß╗çp	f	f	\N	2026-05-06 02:22:07.970875	f
55b8bee6-05a5-4b17-bee5-507c0a9219b2	c371c0ff-643e-4ccd-9ac7-0830392411a4	11111111-1111-1111-1111-111111111111	dddddddd-dddd-dddd-dddd-dddddddddddd	5	MUAHAHAHAHAHA Gß║ª G├ÇGA 	t	f	\N	2026-05-06 02:51:37.56895	f
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, room_number, floor, building, status, current_appointment_id, created_at, updated_at, deleted, hospital_id) FROM stdin;
3b597082-2509-4046-ac8c-cbdea1a263fc	123	2	B	AVAILABLE	\N	2026-05-09 01:53:46.873638	2026-05-10 16:29:54.191629	f	86025814-e278-4563-9c22-5b02bef5ad78
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedules (id, doctor_id, date, start_time, end_time, max_patients, current_bookings, status, price, created_at, room_id) FROM stdin;
11111111-aaaa-aaaa-aaaa-aaaaaaaa1111	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-02-05 02:22:07.970875	2026-02-05 02:22:07.970875	2026-02-05 02:52:07.970875	10	8	EXPIRED	500000.00	2026-05-06 02:22:07.970875	\N
22222222-aaaa-aaaa-aaaa-aaaaaaaa2222	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-03-07 02:22:07.970875	2026-03-07 02:22:07.970875	2026-03-07 02:52:07.970875	10	5	EXPIRED	500000.00	2026-05-06 02:22:07.970875	\N
44444444-aaaa-aaaa-aaaa-aaaaaaaa4444	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-02-15 02:22:07.970875	2026-02-15 02:22:07.970875	2026-02-15 02:52:07.970875	10	6	EXPIRED	500000.00	2026-05-06 02:22:07.970875	\N
55555555-aaaa-aaaa-aaaa-aaaaaaaa5555	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-03-17 02:22:07.970875	2026-03-17 02:22:07.970875	2026-03-17 02:52:07.970875	10	4	EXPIRED	500000.00	2026-05-06 02:22:07.970875	\N
66666666-aaaa-aaaa-aaaa-aaaaaaaa6666	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-04-16 02:22:07.970875	2026-04-16 02:22:07.970875	2026-04-16 02:52:07.970875	10	2	EXPIRED	500000.00	2026-05-06 02:22:07.970875	\N
93560690-5b30-437a-acd0-49798bedfa2b	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	2026-05-10 00:00:00	2026-05-10 08:00:00	2026-05-10 10:00:00	10	0	CANCELLED	323242.00	2026-05-09 02:26:34.451034	3b597082-2509-4046-ac8c-cbdea1a263fc
33333333-aaaa-aaaa-aaaa-aaaaaaaa3333	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-04-06 02:22:07.97	2026-04-06 02:22:07.970875	2026-04-06 02:52:07.970875	10	3	EXPIRED	500000.00	2026-05-06 02:22:07.970875	\N
80955184-ddb7-4ab3-a1c5-f1c1b5e497bb	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-05-07 00:00:00	2026-05-07 12:00:00	2026-05-07 13:30:00	10	0	EXPIRED	324234.00	2026-05-06 22:46:36.633819	\N
6bb91b65-8af9-4ae8-be96-23a6ec8ac798	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	2026-05-07 00:00:00	2026-05-07 13:30:00	2026-05-07 15:00:00	10	0	EXPIRED	388888.00	2026-05-06 23:07:19.583539	\N
eaaa2104-ce19-42bc-b92d-9e223a4f04ca	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-05-11 00:00:00	2026-05-11 07:30:00	2026-05-11 09:00:00	10	0	EXPIRED	123123.00	2026-05-10 16:33:50.135886	3b597082-2509-4046-ac8c-cbdea1a263fc
78ef0ff7-6ce3-4d31-a826-adef1cb4893b	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-05-10 00:00:00	2026-05-10 08:00:00	2026-05-10 10:00:00	10	1	EXPIRED	455555.00	2026-05-09 02:30:11.00423	3b597082-2509-4046-ac8c-cbdea1a263fc
1e948422-78ee-4525-90f1-546129678c5a	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	2026-05-08 00:00:00	2026-05-08 10:00:00	2026-05-08 11:30:00	10	1	EXPIRED	232131.00	2026-05-07 22:57:05.977762	\N
4da36908-f4ec-4c27-8f71-2917e0ac6eaa	dddddddd-dddd-dddd-dddd-dddddddddddd	2026-05-13 00:00:00	2026-05-13 07:30:00	2026-05-13 09:30:00	10	0	EXPIRED	123123.00	2026-05-12 00:43:44.226201	3b597082-2509-4046-ac8c-cbdea1a263fc
c58333ed-0c67-48e8-a34b-597aaf344843	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	2026-06-01 00:00:00	2026-06-01 07:30:00	2026-06-01 09:00:00	10	1	AVAILABLE	535553.00	2026-06-01 01:25:52.616965	3b597082-2509-4046-ac8c-cbdea1a263fc
3d47ae86-8c4c-4090-b1ba-e499d3986a6e	aa8f6898-272d-41e4-aaaa-b58cdbba87d3	2026-06-02 00:00:00	2026-06-02 07:30:00	2026-06-02 09:30:00	10	0	AVAILABLE	111111.00	2026-06-01 01:34:01.504872	3b597082-2509-4046-ac8c-cbdea1a263fc
\.


--
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specialties (id, name, description, department_id, created_at, updated_at, code, category, hospital_id) FROM stdin;
cccccccc-cccc-cccc-cccc-cccccccccccc	Tim mß║ích can thiß╗çp	─Éiß╗üu trß╗ï bß╗çnh l├╜ tim mß║ích	bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	2026-05-06 02:22:07.970875	2026-05-06 02:22:07.970875	TMCT	INTERNAL_MEDICINE	86025814-e278-4563-9c22-5b02bef5ad78
7d413c58-18e6-442b-8d81-79dd17fe90ba	X├ëT NGHIß╗åM TIM, PHß╗öI	X├ëT NGHIß╗åM C├üC THß╗¿	e3b22055-7c7d-47b0-bee8-ee2b6b3f0058	2026-05-13 19:42:10.783776	2026-05-13 19:42:10.783776	XNNT_D0C03	LABORATORY	86025814-e278-4563-9c22-5b02bef5ad78
\.


--
-- Data for Name: system_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configs (id, config_key, config_value, config_type, group_name, display_name, description, display_order, is_active, created_at, updated_at, updated_by) FROM stdin;
38d97dd3-46b9-400f-a293-ab17922a0a79	CONTACT_ADDRESS	123 Nguyß╗àn Huß╗ç, Quß║¡n 1, TP.HCM	TEXT	CONTACT	─Éß╗ïa chß╗ë	\N	3	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
103ac1d0-2222-45c8-bf3a-38aeb1ae77f4	SOCIAL_ZALO	https://zalo.me/healthcareconnect	TEXT	SOCIAL	Zalo	\N	2	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
1adb0352-445a-411a-9754-772f61f6eea6	SOCIAL_YOUTUBE	https://youtube.com/healthcareconnect	TEXT	SOCIAL	YouTube	\N	3	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
a60b545f-94e0-410f-a17c-2bfe2d2620e3	SOCIAL_TIKTOK	https://tiktok.com/healthcareconnect	TEXT	SOCIAL	TikTok	\N	4	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
493ba929-68fe-421f-ac45-2fd9eb1950a4	FOOTER_DESCRIPTION	Nß╗ün tß║úng kß║┐t nß╗æi bß╗çnh nh├ón vß╗¢i b├íc s─⌐ h├áng ─æß║ºu, ─æß║╖t lß╗ïch kh├ím dß╗à d├áng, t╞░ vß║Ñn trß╗▒c tuyß║┐n 24/7	TEXT	FOOTER	M├┤ tß║ú footer	\N	1	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
5a92937c-ace8-4915-b672-67d39409d3f8	FOOTER_COPYRIGHT	┬⌐ 2025 Healthcare Connect. Tß║Ñt cß║ú c├íc quyß╗ün ─æ╞░ß╗úc bß║úo l╞░u.	TEXT	FOOTER	Copyright	\N	2	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
eb87d94a-d039-453a-b7d7-30103f63434f	HOME_STATS_EN	[\r\n    {"value":"500+","label":"Doctors","icon":"≡ƒæ¿ΓÇìΓÜò∩╕Å"},\r\n    {"value":"50K+","label":"Patients","icon":"≡ƒæÑ"},\r\n    {"value":"100+","label":"Hospitals","icon":"≡ƒÅÑ"},\r\n    {"value":"4.9","label":"Rating","icon":"Γ¡É"}\r\n]	JSON	HOME	Stats EN	\N	3	t	2026-05-14 00:25:52.625282	2026-05-14 00:25:52.625282	\N
415bcc97-883e-4ea3-b44b-eb885846dcbb	HOME_CTA_TITLE_EN	Ready to take care of your health?	TEXT	HOME	CTA Title EN	\N	4	t	2026-05-14 00:25:52.625282	2026-05-14 00:25:52.625282	\N
50fb3106-7b8a-4e69-b54c-feb85b468607	HOME_CTA_SUBTITLE_EN	Book an appointment today for free consultation	TEXT	HOME	CTA Subtitle EN	\N	5	t	2026-05-14 00:25:52.625282	2026-05-14 00:25:52.625282	\N
845d4968-c23d-4676-a803-8dbf1b3998aa	HOME_CTA_BUTTON_TEXT_EN	Register Now	TEXT	HOME	CTA Button Text EN	\N	6	t	2026-05-14 00:25:52.625282	2026-05-14 00:25:52.625282	\N
111cf391-6a70-4388-8db2-9f3558fa7c79	HOME_STATS_VI	[\r\n    {"value":"500+","label":"B├íc s─⌐","icon":"≡ƒæ¿ΓÇìΓÜò∩╕Å"},\r\n    {"value":"50K+","label":"Bß╗çnh nh├ón","icon":"≡ƒæÑ"},\r\n    {"value":"100+","label":"Bß╗çnh viß╗çn","icon":"≡ƒÅÑ"},\r\n    {"value":"4.9","label":"─É├ính gi├í","icon":"Γ¡É"}\r\n]	JSON	HOME	Thß╗æng k├¬	\N	3	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
b0f848a3-acc5-4ae8-bd56-2b77250c693a	SYSTEM_NAME	Healthcare Connectttttttt	TEXT	GENERAL	T├¬n hß╗ç thß╗æng	\N	1	t	2026-05-13 23:48:01.654468	2026-05-18 03:13:00.689289	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
8b096cfd-21d7-4b9a-b32a-c7a62316305e	HOME_HERO_SLIDES_EN	[\n    {\n        "id": 1,\n        "title": "Comprehensive Healthcare",\n        "subtitle": "Easy appointment booking",\n        "description": "Connect with top doctors",\n        "icon": "≡ƒÅÑ",\n        "imageUrl": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=1080&fit=crop"\n    },\n    {\n        "id": 2,\n        "title": "24/7 Online Consultation",\n        "subtitle": "Doctors ready to answer",\n        "description": "Ask questions and get remote consultation",\n        "icon": "≡ƒÆ¼",\n        "imageUrl": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&h=1080&fit=crop"\n    },\n    {\n        "id": 3,\n        "title": "Quick Booking",\n        "subtitle": "Save waiting time",\n        "description": "Choose doctor, pick time, confirm instantly",\n        "icon": "≡ƒôà",\n        "imageUrl": "https://images.unsplash.com/photo-1581595220894-b0739db3e212?w=1920&h=1080&fit=crop"\n    }\n]	JSON	HOME	Hero Slides EN	\N	1	t	2026-05-14 00:25:52.625282	2026-05-14 00:25:52.625282	\N
3008f7a8-4da9-4de0-84c2-4d53303cb3b0	SYSTEM_LOGO_URL	https://img.pikbest.com/png-images/20241011/medical-hospital-logo-vector-icon-art_10948363.png!bw800	IMAGE	GENERAL	Logo hß╗ç thß╗æng	\N	2	t	2026-05-13 23:48:01.654468	2026-05-15 00:15:31.652871	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
84bd9242-b2dd-4e07-a1ed-d87d70a3e2f8	CONTACT_PHONE	1900 1234	TEXT	CONTACT	Sß╗æ ─æiß╗çn thoß║íi	\N	1	t	2026-05-13 23:48:01.654468	2026-05-15 00:00:48.613809	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
b0fb49b2-92df-4d20-b16e-e4ae285276d0	HOME_HERO_SLIDES_VI	[\n    {\n        "id": 1,\n        "title": "Ch─âm s├│c sß╗⌐c khß╗Åe to├án diß╗çn kkkkk",\n        "subtitle": "─Éß║╖t lß╗ïch kh├ím dß╗à d├áng",\n        "description": "Kß║┐t nß╗æi vß╗¢i b├íc s─⌐ h├áng ─æß║ºu",\n        "icon": "≡ƒÅÑ",\n        "imageUrl": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=1080&fit=crop"\n    },\n    {\n        "id": 2,\n        "title": "T╞░ vß║Ñn trß╗▒c tuyß║┐n 24/7",\n        "subtitle": "B├íc s─⌐ sß║╡n s├áng giß║úi ─æ├íp",\n        "description": "─Éß║╖t c├óu hß╗Åi v├á nhß║¡n t╞░ vß║Ñn tß╗½ xa",\n        "icon": "≡ƒÆ¼",\n        "imageUrl": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&h=1080&fit=crop"\n    },\n    {\n        "id": 3,\n        "title": "─Éß║╖t lß╗ïch nhanh ch├│ng",\n        "subtitle": "Tiß║┐t kiß╗çm thß╗¥i gian chß╗¥ ─æß╗úi",\n        "description": "Chß╗ìn b├íc s─⌐, chß╗ìn giß╗¥, x├íc nhß║¡n ngay",\n        "icon": "≡ƒôà",\n        "imageUrl": "https://images.unsplash.com/photo-1581595220894-b0739db3e212?w=1920&h=1080&fit=crop"\n    }\n]	JSON	HOME	Hero Slides	\N	1	t	2026-05-13 23:48:01.654468	2026-05-14 02:23:21.84953	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
59748636-2a71-40f1-9673-ea95acedeca5	CONTACT_EMAIL	support@healthcareconnect.vn	TEXT	CONTACT	Email	\N	2	t	2026-05-13 23:48:01.654468	2026-05-15 00:00:57.557775	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
6259362e-b1dc-46ea-b5ac-d8b3e369892d	SOCIAL_FACEBOOK	https://www.facebook.com	TEXT	SOCIAL	Facebook	\N	1	t	2026-05-13 23:48:01.654468	2026-05-15 00:05:13.544907	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
5c73ff7c-9b86-468a-8b42-51a542ddc11d	HOME_CTA_SUBTITLE_VI	─Éß║╖t lß╗ïch ngay h├┤m nay ─æß╗â ─æ╞░ß╗úc t╞░ vß║Ñn miß╗àn ph├¡	TEXT	HOME	CTA Subtitle	\N	5	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
2eca0e4e-0e8f-4c78-b8a6-3ec72567eb06	HOME_CTA_BUTTON_TEXT_VI	─É─âng k├╜ ngay	TEXT	HOME	CTA Button Text	\N	6	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
e7b884b7-23d7-4e5a-b1e1-ccc831523020	HOME_CTA_BACKGROUND_IMAGE	https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=600&fit=crop	IMAGE	HOME	CTA Background Image	\N	7	t	2026-05-14 10:36:22.528757	2026-05-14 10:36:22.528757	\N
aed5d374-6ea2-4708-b200-2871b4be60e9	HOME_FEATURES_EN	[\n    {\n        "icon": "≡ƒæ¿ΓÇìΓÜò∩╕Å",\n        "title": "Expert Doctors",\n        "desc": "Hundreds of highly qualified doctors with years of experience from leading hospitals. Carefully selected and trained.",\n        "color": "from-blue-500 to-cyan-500"\n    },\n    {\n        "icon": "≡ƒôà",\n        "title": "Easy Booking",\n        "desc": "Choose doctor, pick suitable time, confirm instantly. Automatic reminder system via email and SMS.",\n        "color": "from-green-500 to-teal-500"\n    },\n    {\n        "icon": "≡ƒÆè",\n        "title": "E-Prescription",\n        "desc": "Receive digital prescription immediately after consultation. Download and use at any pharmacy.",\n        "color": "from-purple-500 to-pink-500"\n    },\n    {\n        "icon": "≡ƒñû",\n        "title": "AI Assistant",\n        "desc": "AI analyzes symptoms, suggests appropriate specialty. Helps doctors auto-summarize medical records.",\n        "color": "from-orange-500 to-red-500"\n    },\n    {\n        "icon": "≡ƒÅÑ",\n        "title": "Multi-Hospital",\n        "desc": "Connect with hundreds of hospitals and clinics nationwide. Easily find medical facilities near you.",\n        "color": "from-indigo-500 to-blue-500"\n    },\n    {\n        "icon": "Γ¡É",\n        "title": "Transparent Reviews",\n        "desc": "Read real reviews from patients who have visited. Transparent ratings help you choose the right doctor.",\n        "color": "from-yellow-500 to-amber-500"\n    }\n]	JSON	HOME	Features EN	\N	2	t	2026-05-14 00:25:52.625282	2026-05-14 00:25:52.625282	\N
0d7c5a8a-4f86-4af0-80db-ee356ba2a404	HOME_CTA_TITLE_VI	Bß║ín ─æ├ú sß║╡n s├áng ch─âm s├│c sß╗⌐c khß╗Åe cß╗ºa m├¼nh ch╞░a?	TEXT	HOME	CTA Title	\N	4	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
b957d1e4-93c1-4041-afa4-cce676830839	HOME_FEATURES_VI	[\n    {\n        "icon": "≡ƒæ¿ΓÇìΓÜò∩╕Å",\n        "title": "─Éß╗Öi ng┼⌐ b├íc s─⌐ giß╗Åi",\n        "desc": "H├áng tr─âm b├íc s─⌐ chuy├¬n m├┤n cao, gi├áu kinh nghiß╗çm tß╗½ c├íc bß╗çnh viß╗çn h├áng ─æß║ºu. ─É╞░ß╗úc tuyß╗ân chß╗ìn kß╗╣ l╞░ß╗íng v├á ─æ├áo tß║ío b├ái bß║ún.",\n        "color": "from-blue-500 to-cyan-500"\n    },\n    {\n        "icon": "≡ƒôà",\n        "title": "─Éß║╖t lß╗ïch dß╗à d├áng",\n        "desc": "Chß╗ìn b├íc s─⌐, chß╗ìn khung giß╗¥ ph├╣ hß╗úp, x├íc nhß║¡n trong t├¡ch tß║»c. Hß╗ç thß╗æng nhß║»c lß╗ïch tß╗▒ ─æß╗Öng qua email v├á SMS.",\n        "color": "from-green-500 to-teal-500"\n    },\n    {\n        "icon": "≡ƒÆè",\n        "title": "K├¬ ─æ╞ín trß╗▒c tuyß║┐n",\n        "desc": "Nhß║¡n ─æ╞ín thuß╗æc ─æiß╗çn tß╗¡ ngay sau khi kß║┐t th├║c buß╗òi kh├ím. C├│ thß╗â tß║úi vß╗ü v├á sß╗¡ dß╗Ñng tß║íi bß║Ñt kß╗│ nh├á thuß╗æc n├áo.",\n        "color": "from-purple-500 to-pink-500"\n    },\n    {\n        "icon": "≡ƒñû",\n        "title": "AI th├┤ng minh",\n        "desc": "Trß╗ú l├╜ ß║úo ph├ón t├¡ch triß╗çu chß╗⌐ng, gß╗úi ├╜ chuy├¬n khoa ph├╣ hß╗úp. Hß╗ù trß╗ú b├íc s─⌐ t├│m tß║»t bß╗çnh ├ín tß╗▒ ─æß╗Öng.",\n        "color": "from-orange-500 to-red-500"\n    },\n    {\n        "icon": "≡ƒÅÑ",\n        "title": "─Éa dß║íng bß╗çnh viß╗çn",\n        "desc": "Kß║┐t nß╗æi vß╗¢i h├áng tr─âm bß╗çnh viß╗çn v├á ph├▓ng kh├ím tr├¬n to├án quß╗æc. Dß╗à d├áng t├¼m c╞í sß╗ƒ y tß║┐ gß║ºn bß║ín nhß║Ñt.",\n        "color": "from-indigo-500 to-blue-500"\n    },\n    {\n        "icon": "Γ¡É",\n        "title": "─É├ính gi├í minh bß║ích",\n        "desc": "Xem ─æ├ính gi├í thß╗▒c tß╗½ bß╗çnh nh├ón ─æ├ú kh├ím. ─Éiß╗âm sß╗æ minh bß║ích gi├║p bß║ín lß╗▒a chß╗ìn b├íc s─⌐ ph├╣ hß╗úp.",\n        "color": "from-yellow-500 to-amber-500"\n    }\n]	JSON	HOME	T├¡nh n─âng	\N	2	t	2026-05-13 23:48:01.654468	2026-05-13 23:48:01.654468	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, password, role, phone, created_at, verification_code, verification_expiry, is_enabled, lock_reason, locked_at, locked_by, unlocked_at, unlocked_by) FROM stdin;
22222222-2222-2222-2222-222222222222	Trß║ºn Thß╗ï B├¼nh	binh.patient@example.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	PATIENT	0901234568	2026-05-06 02:22:07.970875	\N	\N	t	\N	\N	\N	\N	\N
33333333-3333-3333-3333-333333333333	L├¬ Thß╗ï C├║c	cuc.patient@example.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	PATIENT	0901234569	2026-05-06 02:22:07.970875	\N	\N	t	\N	\N	\N	\N	\N
44444444-4444-4444-4444-444444444444	Phß║ím V─ân ─Éß╗⌐c	duc.patient@example.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	PATIENT	0901234570	2026-05-06 02:22:07.970875	\N	\N	t	\N	\N	\N	\N	\N
55555555-5555-5555-5555-555555555555	Ho├áng Thß╗ï Em	em.patient@example.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	PATIENT	0901234571	2026-05-06 02:22:07.970875	\N	\N	t	\N	\N	\N	\N	\N
66666666-6666-6666-6666-666666666666	B├íc s─⌐ L├¬ V─ân C╞░ß╗¥ng	cuong.doctor@example.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	DOCTOR	0901234572	2026-05-06 02:22:07.970875	\N	\N	t	\N	\N	\N	\N	\N
e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	Admin System	admin@healthcare.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	ADMIN	0901234571	2026-05-06 09:22:01.017779	\N	\N	t	\N	\N	\N	\N	\N
c75b68f7-05b1-45ed-ae68-f7042080c1d1	Ho├áng Tuß║Ñn Long	tuanlong30112@gmail.com	$2a$10$TkXTazbUlwhyX0BVcxHjPOfcIUTeZiAX1CSeEeyba26zN6h2OV1xS	DOCTOR	09334242342	2026-05-06 16:14:27.005738	\N	2026-05-07 16:14:26.991451	t	\N	\N	\N	\N	\N
659f1923-9223-45de-b27d-30c8fc881389	Long Coin Base	longcoinbase@gmail.com	$2a$10$Xe09T0lwPROgWnx5Pl7ySOprM41dIYpOWliUbXmVwQwkrcE7T/k.m	RECEPTIONIST	0389465451	2026-05-06 18:28:07.580485	\N	2026-05-07 18:28:07.580485	t	\N	\N	\N	\N	\N
ef05629a-152f-4294-80c0-2f644410fba8	L├¬ Trß║ºn Anh	letrananhx1999x@gmail.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	HOSPITAL_MANAGER	09867946454	2026-05-06 16:30:08.50025	\N	2026-05-07 16:30:08.50025	t	\N	\N	\N	\N	\N
11111111-1111-1111-1111-111111111111	Nguyß╗àn V─ân An Ngu	an.patient@example.com	$2a$10$2aSqbg6eGGkpL2g6VLoCIu96/Yu5ZTK/1yjtNEWxYjbKallXTdbK6	PATIENT	0901234567	2026-05-06 02:22:07.970875	\N	\N	t	\N	\N	\N	\N	\N
289c1f58-5533-43ee-b712-d22ac4d38e68	Long KAKAKKAKA	longlong30112@gmail.com	$2a$10$zo6MtwqUNfMo.6Vv.gXRueKiuX3kNDzRdUT.FNia9awbjRcdLy.FO	PATIENT	09832324142	2026-05-07 22:41:26.281556	\N	2026-05-08 22:41:26.217514	t	Ngu Dß╗æt	2026-05-27 19:51:30.708868	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	2026-05-27 19:51:47.22427	e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15
\.


--
-- Name: doctor_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_history_id_seq', 70, true);


--
-- Name: receptionist_activity_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receptionist_activity_history_id_seq', 65, true);


--
-- Name: receptionist_application_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receptionist_application_history_id_seq', 33, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: doctor_history doctor_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_history
    ADD CONSTRAINT doctor_history_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_doctor_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_doctor_code_key UNIQUE (doctor_code);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_key UNIQUE (user_id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: hospital_working_hours hospital_working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_working_hours
    ADD CONSTRAINT hospital_working_hours_pkey PRIMARY KEY (id);


--
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- Name: invalidated_token invalidated_token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invalidated_token
    ADD CONSTRAINT invalidated_token_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: receptionist_activity_history receptionist_activity_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history
    ADD CONSTRAINT receptionist_activity_history_pkey PRIMARY KEY (id);


--
-- Name: receptionist_application_history receptionist_application_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_application_history
    ADD CONSTRAINT receptionist_application_history_pkey PRIMARY KEY (id);


--
-- Name: receptionists receptionists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionists
    ADD CONSTRAINT receptionists_pkey PRIMARY KEY (id);


--
-- Name: receptionists receptionists_receptionist_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionists
    ADD CONSTRAINT receptionists_receptionist_code_key UNIQUE (receptionist_code);


--
-- Name: receptionists receptionists_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionists
    ADD CONSTRAINT receptionists_user_id_key UNIQUE (user_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_room_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_number_key UNIQUE (room_number);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: specialties specialties_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_name_key UNIQUE (name);


--
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (id);


--
-- Name: system_configs system_configs_config_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_config_key_key UNIQUE (config_key);


--
-- Name: system_configs system_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_pkey PRIMARY KEY (id);


--
-- Name: hospitals uc_manager_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT uc_manager_unique UNIQUE (manager_id);


--
-- Name: departments uk_department_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uk_department_code UNIQUE (code);


--
-- Name: specialties uk_specialty_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT uk_specialty_code UNIQUE (code);


--
-- Name: reviews unique_appointment_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_appointment_review UNIQUE (appointment_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_appointments_booking_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_booking_type ON public.appointments USING btree (booking_type);


--
-- Name: idx_appointments_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_doctor_id ON public.appointments USING btree (doctor_id);


--
-- Name: idx_appointments_hospital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_hospital_id ON public.appointments USING btree (hospital_id);


--
-- Name: idx_appointments_patient_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_patient_name ON public.appointments USING btree (patient_name);


--
-- Name: idx_appointments_patient_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_patient_phone ON public.appointments USING btree (patient_phone);


--
-- Name: idx_appointments_room_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_room_id ON public.appointments USING btree (room_id);


--
-- Name: idx_departments_hospital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_departments_hospital_id ON public.departments USING btree (hospital_id);


--
-- Name: idx_dept_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dept_category ON public.departments USING btree (category);


--
-- Name: idx_doctor_history_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_history_action ON public.doctor_history USING btree (action);


--
-- Name: idx_doctor_history_actor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_history_actor_id ON public.doctor_history USING btree (actor_id);


--
-- Name: idx_doctor_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_history_created_at ON public.doctor_history USING btree (created_at);


--
-- Name: idx_doctor_history_doctor_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_history_doctor_action ON public.doctor_history USING btree (doctor_id, action, created_at DESC);


--
-- Name: idx_doctor_history_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_history_doctor_id ON public.doctor_history USING btree (doctor_id);


--
-- Name: idx_doctor_history_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_history_status ON public.doctor_history USING btree (old_status, new_status);


--
-- Name: idx_medical_records_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_appointment ON public.medical_records USING btree (appointment_id);


--
-- Name: idx_medical_records_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_created_at ON public.medical_records USING btree (created_at);


--
-- Name: idx_medical_records_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_doctor ON public.medical_records USING btree (doctor_id);


--
-- Name: idx_medical_records_hospital; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_hospital ON public.medical_records USING btree (hospital_id);


--
-- Name: idx_medical_records_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_patient ON public.medical_records USING btree (patient_id);


--
-- Name: idx_medical_records_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_status ON public.medical_records USING btree (status);


--
-- Name: idx_medicines_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_category ON public.medicines USING btree (category);


--
-- Name: idx_medicines_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_code ON public.medicines USING btree (code) WHERE (deleted = false);


--
-- Name: idx_medicines_code_hospital; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_medicines_code_hospital ON public.medicines USING btree (code, hospital_id) WHERE (deleted = false);


--
-- Name: idx_medicines_expiry_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_expiry_date ON public.medicines USING btree (expiry_date);


--
-- Name: idx_medicines_hospital; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_hospital ON public.medicines USING btree (hospital_id);


--
-- Name: idx_medicines_hospital_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_hospital_code ON public.medicines USING btree (hospital_id, code);


--
-- Name: idx_medicines_low_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_low_stock ON public.medicines USING btree (stock_quantity, min_stock) WHERE (deleted = false);


--
-- Name: idx_medicines_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_name ON public.medicines USING btree (name);


--
-- Name: idx_payment_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_appointment_id ON public.payments USING btree (appointment_id);


--
-- Name: idx_payments_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_doctor_id ON public.payments USING btree (doctor_id);


--
-- Name: idx_payments_hospital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_hospital_id ON public.payments USING btree (hospital_id);


--
-- Name: idx_prescription_items_medicine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescription_items_medicine ON public.prescription_items USING btree (medicine_id);


--
-- Name: idx_prescription_items_prescription; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescription_items_prescription ON public.prescription_items USING btree (prescription_id);


--
-- Name: idx_prescriptions_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_created_by ON public.prescriptions USING btree (created_by);


--
-- Name: idx_prescriptions_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_doctor ON public.prescriptions USING btree (doctor_id);


--
-- Name: idx_prescriptions_hospital; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_hospital ON public.prescriptions USING btree (hospital_id);


--
-- Name: idx_prescriptions_medical_record; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_medical_record ON public.prescriptions USING btree (medical_record_id);


--
-- Name: idx_prescriptions_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_patient ON public.prescriptions USING btree (patient_id);


--
-- Name: idx_prescriptions_prescription_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_prescription_date ON public.prescriptions USING btree (prescription_date);


--
-- Name: idx_prescriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_status ON public.prescriptions USING btree (status);


--
-- Name: idx_prescriptions_valid_until; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_valid_until ON public.prescriptions USING btree (valid_until);


--
-- Name: idx_rec_act_history_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_act_history_action ON public.receptionist_activity_history USING btree (action);


--
-- Name: idx_rec_act_history_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_act_history_appointment ON public.receptionist_activity_history USING btree (appointment_id);


--
-- Name: idx_rec_act_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_act_history_created_at ON public.receptionist_activity_history USING btree (created_at);


--
-- Name: idx_rec_act_history_hospital; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_act_history_hospital ON public.receptionist_activity_history USING btree (hospital_id);


--
-- Name: idx_rec_act_history_receptionist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_act_history_receptionist ON public.receptionist_activity_history USING btree (receptionist_id);


--
-- Name: idx_rec_app_history_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_app_history_action ON public.receptionist_application_history USING btree (action);


--
-- Name: idx_rec_app_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_app_history_created_at ON public.receptionist_application_history USING btree (created_at);


--
-- Name: idx_rec_app_history_receptionist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rec_app_history_receptionist ON public.receptionist_application_history USING btree (receptionist_id);


--
-- Name: idx_receptionists_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptionists_code ON public.receptionists USING btree (receptionist_code);


--
-- Name: idx_receptionists_hospital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptionists_hospital_id ON public.receptionists USING btree (hospital_id);


--
-- Name: idx_receptionists_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptionists_status ON public.receptionists USING btree (status);


--
-- Name: idx_receptionists_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receptionists_user_id ON public.receptionists USING btree (user_id);


--
-- Name: idx_reviews_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_appointment ON public.reviews USING btree (appointment_id);


--
-- Name: idx_reviews_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_deleted ON public.reviews USING btree (deleted);


--
-- Name: idx_reviews_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_doctor ON public.reviews USING btree (doctor_id);


--
-- Name: idx_reviews_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_patient ON public.reviews USING btree (patient_id);


--
-- Name: idx_rooms_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rooms_deleted ON public.rooms USING btree (deleted);


--
-- Name: idx_rooms_hospital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rooms_hospital_id ON public.rooms USING btree (hospital_id);


--
-- Name: idx_rooms_room_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rooms_room_number ON public.rooms USING btree (room_number);


--
-- Name: idx_rooms_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rooms_status ON public.rooms USING btree (status);


--
-- Name: idx_schedule_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedule_lookup ON public.schedules USING btree (doctor_id, date);


--
-- Name: idx_schedules_room_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedules_room_id ON public.schedules USING btree (room_id);


--
-- Name: idx_spec_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_spec_category ON public.specialties USING btree (category);


--
-- Name: idx_specialties_hospital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_specialties_hospital_id ON public.specialties USING btree (hospital_id);


--
-- Name: idx_system_configs_config_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_configs_config_key ON public.system_configs USING btree (config_key);


--
-- Name: idx_system_configs_group_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_configs_group_name ON public.system_configs USING btree (group_name);


--
-- Name: idx_system_configs_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_configs_is_active ON public.system_configs USING btree (is_active);


--
-- Name: idx_users_locked_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_locked_at ON public.users USING btree (locked_at);


--
-- Name: idx_users_locked_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_locked_by ON public.users USING btree (locked_by);


--
-- Name: idx_users_unlocked_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_unlocked_at ON public.users USING btree (unlocked_at);


--
-- Name: idx_users_unlocked_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_unlocked_by ON public.users USING btree (unlocked_by);


--
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: appointments appointments_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: appointments appointments_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: departments departments_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: appointments fk_appointment_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: payments fk_appointment_payment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_appointment_payment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: appointments fk_appointment_schedule; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_schedule FOREIGN KEY (schedule_id) REFERENCES public.schedules(id);


--
-- Name: doctors fk_doctor_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: doctor_history fk_doctor_history_actor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_history
    ADD CONSTRAINT fk_doctor_history_actor FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: doctor_history fk_doctor_history_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_history
    ADD CONSTRAINT fk_doctor_history_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: doctors fk_doctor_hospital; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: doctors fk_doctor_specialty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_specialty FOREIGN KEY (specialty_id) REFERENCES public.specialties(id);


--
-- Name: doctors fk_doctor_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: hospitals fk_hospital_manager; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT fk_hospital_manager FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: prescriptions fk_prescriptions_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescriptions_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: prescriptions fk_prescriptions_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;


--
-- Name: prescriptions fk_prescriptions_hospital; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescriptions_hospital FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT;


--
-- Name: prescriptions fk_prescriptions_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: schedules fk_schedule_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: specialties fk_specialties_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT fk_specialties_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: hospital_working_hours hospital_working_hours_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_working_hours
    ADD CONSTRAINT hospital_working_hours_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: medical_records medical_records_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: medical_records medical_records_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: medical_records medical_records_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: medicines medicines_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: payments payments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: payments payments_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: prescription_items prescription_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: prescription_items prescription_items_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: prescriptions prescriptions_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id);


--
-- Name: receptionist_activity_history receptionist_activity_history_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history
    ADD CONSTRAINT receptionist_activity_history_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: receptionist_activity_history receptionist_activity_history_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history
    ADD CONSTRAINT receptionist_activity_history_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: receptionist_activity_history receptionist_activity_history_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history
    ADD CONSTRAINT receptionist_activity_history_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: receptionist_activity_history receptionist_activity_history_receptionist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history
    ADD CONSTRAINT receptionist_activity_history_receptionist_id_fkey FOREIGN KEY (receptionist_id) REFERENCES public.receptionists(id) ON DELETE CASCADE;


--
-- Name: receptionist_activity_history receptionist_activity_history_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_activity_history
    ADD CONSTRAINT receptionist_activity_history_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id);


--
-- Name: receptionist_application_history receptionist_application_history_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_application_history
    ADD CONSTRAINT receptionist_application_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: receptionist_application_history receptionist_application_history_receptionist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionist_application_history
    ADD CONSTRAINT receptionist_application_history_receptionist_id_fkey FOREIGN KEY (receptionist_id) REFERENCES public.receptionists(id) ON DELETE CASCADE;


--
-- Name: receptionists receptionists_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionists
    ADD CONSTRAINT receptionists_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: receptionists receptionists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receptionists
    ADD CONSTRAINT receptionists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: reviews reviews_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: reviews reviews_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: rooms rooms_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: schedules schedules_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: specialties specialties_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: system_configs system_configs_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: users users_locked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.users(id);


--
-- Name: users users_unlocked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_unlocked_by_fkey FOREIGN KEY (unlocked_by) REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

