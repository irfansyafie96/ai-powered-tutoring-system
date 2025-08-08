--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.4

-- Started on 2025-08-08 21:26:53

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: ai_powered_tutoring_system_db_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ai_powered_tutoring_system_db_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16414)
-- Name: notes; Type: TABLE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer,
    title character varying(255),
    summary text,
    file_url text,
    file_hash character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notes OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 219 (class 1259 OID 16413)
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 3437 (class 0 OID 0)
-- Dependencies: 219
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- TOC entry 224 (class 1259 OID 16447)
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE TABLE public.quiz_questions (
    id integer NOT NULL,
    note_id integer,
    question text,
    answer text,
    choices text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.quiz_questions OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 223 (class 1259 OID 16446)
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE SEQUENCE public.quiz_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_id_seq OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 3438 (class 0 OID 0)
-- Dependencies: 223
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- TOC entry 222 (class 1259 OID 16429)
-- Name: quiz_scores; Type: TABLE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE TABLE public.quiz_scores (
    id integer NOT NULL,
    user_id integer,
    note_id integer,
    score integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.quiz_scores OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 221 (class 1259 OID 16428)
-- Name: quiz_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE SEQUENCE public.quiz_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_scores_id_seq OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 3439 (class 0 OID 0)
-- Dependencies: 221
-- Name: quiz_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER SEQUENCE public.quiz_scores_id_seq OWNED BY public.quiz_scores.id;


--
-- TOC entry 228 (class 1259 OID 16482)
-- Name: saved_notes; Type: TABLE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE TABLE public.saved_notes (
    id integer NOT NULL,
    user_id integer,
    note_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_notes OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 227 (class 1259 OID 16481)
-- Name: saved_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE SEQUENCE public.saved_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_notes_id_seq OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 3440 (class 0 OID 0)
-- Dependencies: 227
-- Name: saved_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER SEQUENCE public.saved_notes_id_seq OWNED BY public.saved_notes.id;


--
-- TOC entry 226 (class 1259 OID 16462)
-- Name: user_answers; Type: TABLE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE TABLE public.user_answers (
    id integer NOT NULL,
    user_id integer,
    question_id integer,
    answer text,
    is_correct boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_answers OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 225 (class 1259 OID 16461)
-- Name: user_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE SEQUENCE public.user_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_answers_id_seq OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 3441 (class 0 OID 0)
-- Dependencies: 225
-- Name: user_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER SEQUENCE public.user_answers_id_seq OWNED BY public.user_answers.id;


--
-- TOC entry 218 (class 1259 OID 16400)
-- Name: users; Type: TABLE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 217 (class 1259 OID 16399)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ai_powered_tutoring_system_db_user;

--
-- TOC entry 3442 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3241 (class 2604 OID 16417)
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- TOC entry 3245 (class 2604 OID 16450)
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- TOC entry 3243 (class 2604 OID 16432)
-- Name: quiz_scores id; Type: DEFAULT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_scores ALTER COLUMN id SET DEFAULT nextval('public.quiz_scores_id_seq'::regclass);


--
-- TOC entry 3249 (class 2604 OID 16485)
-- Name: saved_notes id; Type: DEFAULT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.saved_notes ALTER COLUMN id SET DEFAULT nextval('public.saved_notes_id_seq'::regclass);


--
-- TOC entry 3247 (class 2604 OID 16465)
-- Name: user_answers id; Type: DEFAULT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.user_answers ALTER COLUMN id SET DEFAULT nextval('public.user_answers_id_seq'::regclass);


--
-- TOC entry 3239 (class 2604 OID 16403)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3423 (class 0 OID 16414)
-- Dependencies: 220
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

COPY public.notes (id, user_id, title, summary, file_url, file_hash, created_at) FROM stdin;
\.


--
-- TOC entry 3427 (class 0 OID 16447)
-- Dependencies: 224
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

COPY public.quiz_questions (id, note_id, question, answer, choices, created_at) FROM stdin;
\.


--
-- TOC entry 3425 (class 0 OID 16429)
-- Dependencies: 222
-- Data for Name: quiz_scores; Type: TABLE DATA; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

COPY public.quiz_scores (id, user_id, note_id, score, created_at) FROM stdin;
\.


--
-- TOC entry 3431 (class 0 OID 16482)
-- Dependencies: 228
-- Data for Name: saved_notes; Type: TABLE DATA; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

COPY public.saved_notes (id, user_id, note_id, created_at) FROM stdin;
\.


--
-- TOC entry 3429 (class 0 OID 16462)
-- Dependencies: 226
-- Data for Name: user_answers; Type: TABLE DATA; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

COPY public.user_answers (id, user_id, question_id, answer, is_correct, created_at) FROM stdin;
\.


--
-- TOC entry 3421 (class 0 OID 16400)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

COPY public.users (id, username, email, password, created_at) FROM stdin;
\.


--
-- TOC entry 3443 (class 0 OID 0)
-- Dependencies: 219
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- TOC entry 3444 (class 0 OID 0)
-- Dependencies: 223
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 1, false);


--
-- TOC entry 3445 (class 0 OID 0)
-- Dependencies: 221
-- Name: quiz_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

SELECT pg_catalog.setval('public.quiz_scores_id_seq', 1, false);


--
-- TOC entry 3446 (class 0 OID 0)
-- Dependencies: 227
-- Name: saved_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

SELECT pg_catalog.setval('public.saved_notes_id_seq', 1, false);


--
-- TOC entry 3447 (class 0 OID 0)
-- Dependencies: 225
-- Name: user_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

SELECT pg_catalog.setval('public.user_answers_id_seq', 1, false);


--
-- TOC entry 3448 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 3258 (class 2606 OID 16422)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 16455)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 3260 (class 2606 OID 16435)
-- Name: quiz_scores quiz_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_scores
    ADD CONSTRAINT quiz_scores_pkey PRIMARY KEY (id);


--
-- TOC entry 3266 (class 2606 OID 16488)
-- Name: saved_notes saved_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3264 (class 2606 OID 16470)
-- Name: user_answers user_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 3252 (class 2606 OID 16412)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3254 (class 2606 OID 16408)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3256 (class 2606 OID 16410)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3267 (class 2606 OID 16423)
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3270 (class 2606 OID 16456)
-- Name: quiz_questions quiz_questions_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- TOC entry 3268 (class 2606 OID 16441)
-- Name: quiz_scores quiz_scores_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_scores
    ADD CONSTRAINT quiz_scores_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- TOC entry 3269 (class 2606 OID 16436)
-- Name: quiz_scores quiz_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.quiz_scores
    ADD CONSTRAINT quiz_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3273 (class 2606 OID 16494)
-- Name: saved_notes saved_notes_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- TOC entry 3274 (class 2606 OID 16489)
-- Name: saved_notes saved_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3271 (class 2606 OID 16476)
-- Name: user_answers user_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON DELETE CASCADE;


--
-- TOC entry 3272 (class 2606 OID 16471)
-- Name: user_answers user_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ai_powered_tutoring_system_db_user
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 2070 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO ai_powered_tutoring_system_db_user;


--
-- TOC entry 2072 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO ai_powered_tutoring_system_db_user;


--
-- TOC entry 2071 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO ai_powered_tutoring_system_db_user;


--
-- TOC entry 2069 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO ai_powered_tutoring_system_db_user;


-- Completed on 2025-08-08 21:27:28

--
-- PostgreSQL database dump complete
--

