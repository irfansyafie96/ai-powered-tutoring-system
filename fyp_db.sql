--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-08-08 21:26:12

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: fyp_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO fyp_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16409)
-- Name: notes; Type: TABLE; Schema: public; Owner: fyp_user
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    file_url text NOT NULL,
    summary text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subject text,
    topic text,
    file_hash character varying(128)
);


ALTER TABLE public.notes OWNER TO fyp_user;

--
-- TOC entry 219 (class 1259 OID 16408)
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: fyp_user
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO fyp_user;

--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 219
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fyp_user
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- TOC entry 226 (class 1259 OID 24799)
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    id integer NOT NULL,
    quiz_score_id integer NOT NULL,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_answer text NOT NULL
);


ALTER TABLE public.quiz_questions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24798)
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_id_seq OWNER TO postgres;

--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 225
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- TOC entry 224 (class 1259 OID 24764)
-- Name: quiz_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_scores (
    id integer NOT NULL,
    user_id integer,
    note_id integer,
    difficulty text,
    correct_answers integer NOT NULL,
    total_questions integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_scores OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24763)
-- Name: quiz_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_scores_id_seq OWNER TO postgres;

--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 223
-- Name: quiz_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_scores_id_seq OWNED BY public.quiz_scores.id;


--
-- TOC entry 222 (class 1259 OID 24618)
-- Name: saved_notes; Type: TABLE; Schema: public; Owner: fyp_user
--

CREATE TABLE public.saved_notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    note_id integer NOT NULL,
    saved_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.saved_notes OWNER TO fyp_user;

--
-- TOC entry 221 (class 1259 OID 24617)
-- Name: saved_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: fyp_user
--

CREATE SEQUENCE public.saved_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_notes_id_seq OWNER TO fyp_user;

--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 221
-- Name: saved_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fyp_user
--

ALTER SEQUENCE public.saved_notes_id_seq OWNED BY public.saved_notes.id;


--
-- TOC entry 228 (class 1259 OID 24813)
-- Name: user_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_answers (
    id integer NOT NULL,
    quiz_question_id integer NOT NULL,
    user_selected_option text,
    is_correct boolean NOT NULL
);


ALTER TABLE public.user_answers OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24812)
-- Name: user_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_answers_id_seq OWNER TO postgres;

--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 227
-- Name: user_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_answers_id_seq OWNED BY public.user_answers.id;


--
-- TOC entry 218 (class 1259 OID 16392)
-- Name: users; Type: TABLE; Schema: public; Owner: fyp_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO fyp_user;

--
-- TOC entry 217 (class 1259 OID 16391)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: fyp_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO fyp_user;

--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fyp_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4770 (class 2604 OID 16412)
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- TOC entry 4776 (class 2604 OID 24802)
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 24767)
-- Name: quiz_scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_scores ALTER COLUMN id SET DEFAULT nextval('public.quiz_scores_id_seq'::regclass);


--
-- TOC entry 4772 (class 2604 OID 24621)
-- Name: saved_notes id; Type: DEFAULT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.saved_notes ALTER COLUMN id SET DEFAULT nextval('public.saved_notes_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 24816)
-- Name: user_answers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_answers ALTER COLUMN id SET DEFAULT nextval('public.user_answers_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 16395)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4953 (class 0 OID 16409)
-- Dependencies: 220
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: fyp_user
--

COPY public.notes (id, user_id, file_url, summary, created_at, subject, topic, file_hash) FROM stdin;
1	1	http://localhost:5000/uploads/1751547323654-354736203-Lecture_6_-_Client_-_Server.pdf	# **Client-Server Architecture – Internet Technology**  \n\n## **Introduction**  \nClient/server systems are widely used in commercial applications, including:  \n- Online transaction processing  \n- Decision support systems and data mining  \n- Batch processing  \n- Finance and administrative applications  \n- World Wide Web servers  \n- Video and document servers  \n\n### **Basic Definition**  \n- **Server**: Provides services.  \n- **Client**: Requests services.  \n- **Service**: Any resource (e.g., data, file, control, object, CPU time, display device).  \n\n## **Client-Server Characteristics**  \n- Platform-independent (hardware/OS agnostic).  \n- Location transparency (clients and servers are usually hidden from users).  \n- Scalability:  \n  - **Horizontal**: Adding/removing client workstations with minimal performance impact.  \n  - **Vertical**: Upgrading to larger, faster servers or multiservers.  \n\n## **Client-Server Hardware Roles**  \n- **Client**: Typically a PC initiating requests (e.g., user workstation).  \n- **Server**: A powerful machine dedicated to handling client requests (often in a server room).  \n\n## **Client-Server Software Roles**  \n- Client and server software roles are protocol-dependent (e.g., TCP/IP).  \n- Some devices run both client and server software.  \n- **Web Clients**: Firefox, Chrome, Edge.  \n- **Web Servers**: Apache, Microsoft IIS, Nginx.  \n\n## **Client-Server as Network Architecture**  \n- A network architecture where clients and servers are separated.  \n- **Client**: Uses a GUI to send requests.  \n- **Server**: Responds to client requests.  \n\n### **Types of Servers**  \n- File servers  \n- Database servers  \n- Transaction servers  \n- Mail servers  \n- Directory servers  \n- Cache servers  \n- Mirrored servers  \n- Print servers  \n\n## **Logical Tiers**  \nApplication software is divided into three logical layers:  \n1. **Presentation Logic**: User interface (displays data, handles input).  \n2. **Application Logic**: Processes commands, performs calculations, coordinates tasks.  \n3. **Database Logic**: Manages data storage and retrieval.  \n\n## **Physical Tiers**  \n### **1-Tier Architecture**  \n- All processing on a single host (e.g., mainframes).  \n- Users access via dumb terminals.  \n\n### **2-Tier Architecture (Flat)**  \n- Clients request resources directly from servers.  \n\n### **3-Tier Architecture**  \n1. **Clients** (request services).  \n2. **Application Servers** (process requests using database servers).  \n3. **Database Servers** (provide data).  \n\n### **N-Tier Architecture**  \n- Extends beyond three tiers for greater flexibility, security, and performance.  \n- **Benefits**:  \n  - Independent updates per tier.  \n  - Enhanced security per service.  \n  - Distributed workload.  \n- **Shortcomings**:  \n  - Increased complexity in development and testing.  \n  - Higher need for load balancing and fault tolerance.  \n\n## **Fat Server vs. Fat Client**  \n### **Fat (Thick) Clients**  \n- Powerful devices/programs with minimal server dependence.  \n- Example: Gaming clients (e.g., Lineage II).  \n\n### **Thin Clients**  \n- **Benefits**:  \n  - Lower security risks (no viruses/spyware).  \n  - Easier software management.  \n  - Reduced Total Cost of Ownership (TCO).  \n- **Shortcomings**:  \n  - Server dependency (single point of failure).  \n  - Limited multimedia performance (high bandwidth required).  \n\n### **Factors Driving Thin Client Adoption**  \n- Growth of web-based applications.  \n- High-speed LAN/WAN availability.  \n- Data security concerns.  \n- Energy efficiency.  \n- Low-cost computing devices (e.g., netbooks).  \n\n## **Example Types of Servers**  \n### **File Servers**  \n- Share files across a network.  \n- Clients request file records remotely.  \n\n### **Database Servers**  \n- Process SQL requests and return results.  \n- Data and processing reside on the same machine.  \n\n### **Directory Servers**  \n- Store network resource information (users, hosts).  \n- **Protocols**: X.500, LDAP (simplified X.500).  \n- **Features**: Synchronization, replication, scalability.  \n\n### **Cache Servers**  \n- Improve performance by storing frequently accessed data.  \n- Reduce internet requests (e.g., browser caching).  \n\n### **Mirrored Servers**  \n- Exact replicas of primary servers.  \n- **Purposes**:  \n  - Load balancing (traffic distribution).  \n  - Fault tolerance (backup in case of failure).  \n\n### **Print Servers**  \n- Enable shared printer access over a network.  \n- Support multiple printers per server.  \n\n### **Internet Printing Protocol (IPP)**  \n- Allows printing over LANs/internet.  \n- **Benefits**:  \n  - Printer discovery via IP/URL.  \n  - Remote print job monitoring.  \n\n## **Example: Web Server**  \n### **How Web Pages Work**  \n1. User sends a request.  \n2. Browser forwards the request to the server.  \n3. Server processes the request and returns files.  \n4. Browser displays the content.  \n\n### **Popular Web Servers**  \n- Apache  \n- Microsoft IIS  \n- Tomcat  \n- Netscape Enterprise Server  \n\n### **Virtual Hosting**  \n- Supports multiple domains on a single server.  \n- Uses URLs to differentiate file paths.  \n\n---  \n*End of Summary*	2025-07-03 21:03:37.482844	Internet Technology	Client - Server	\N
2	1	http://localhost:5000/uploads/1751648104404-560330044-Lecture_7_-_DNS.pdf	# **Domain Name System (DNS)**  \n\n## **Domain Name vs IP Address**  \n- **Domain names are assigned because:**  \n  - IP addresses are difficult to remember.  \n  - Companies may change IP addresses without altering their public-facing Internet name.  \n\n## **Top-Level Domains (TLDs)**  \n- **Two main types:**  \n  1. **Generic Top-Level Domains (gTLDs)**  \n     - Examples: `.com`, `.net`  \n  2. **Country Code Top-Level Domains (ccTLDs)**  \n\n## **The Problem**  \n- Every internet-connected device has a unique **IP address**.  \n- **Challenge:** Resolving user-friendly machine names (e.g., `ftmk.utem.edu.my`) to IP addresses (e.g., `10.7.11.10`).  \n\n## **DNS: Domain Name System**  \n- **Key Features:**  \n  - Distributed database  \n  - Hierarchy of name servers  \n  - Application-layer protocol  \n  - Name-address resolution handled at the edge  \n  - Network core is unaware of hostnames  \n\n### **DNS Provides:**  \n- Name-to-IP address translation  \n- Aliasing (canonical names)  \n- Identification of name servers  \n- Mail server names  \n- **Load distribution:**  \n  - Multiple name servers handling queries  \n  - Caching  \n  - Ability to return multiple IP addresses for a name  \n\n## **Authoritative DNS Server**  \n- **Responsible for answering queries about its zone.**  \n  - Configured by the administrator.  \n  - Contains the most current domain name information.  \n- **Zone:** A group of machines under a node in the DNS tree (e.g., `utem.edu.my`).  \n\n### **Finding the DNS Server for a Domain**  \n- **Domain registry** tracks DNS servers for registered domains.  \n- When registering a domain, provide at least **two DNS servers** for the zone.  \n- **Resolution process:** Starts at the **root DNS server**.  \n\n## **Two Types of Authoritative Name Servers**  \n1. **Master Server (Primary Name Server)**  \n   - Stores original master copies of all zone records.  \n2. **Slave Server (Secondary Name Server)**  \n   - Exact replica of the master server.  \n   - Used for:  \n     - Load sharing  \n     - Improving availability (if master fails)  \n   - **Recommendation:** At least **2 slave servers + 1 master server** per domain.  \n\n## **Hosts Table**  \n- **Location:**  \n  - `C:\\Windows\\System32\\Drivers\\etc\\hosts`  \n  - `C:\\Winnt\\System32\\Drivers\\etc\\hosts`  \n- **Viewing:** Open the `hosts` file in **Notepad**.  \n\n### **Reasons for Modifying Hosts Table**  \n1. **Network Testing**  \n   - Test machines or development servers by mapping domain names.  \n2. **Increase Browsing Speed**  \n   - Map frequently visited sites to their IP addresses.  \n3. **Block Spyware/Ad Networks**  \n   - Redirect known ad/spyware domains to `127.0.0.1` (localhost).  \n\n## **Additional Resource**  \n- **Video:** [DNS Explanation](https://www.youtube.com/watch?v=3EvjwlQ43_4)	2025-07-05 00:57:22.314607	Internet Technology	Domain Name System	\N
11	1	http://localhost:5000/uploads/1752077345407-891248709-Lecture_8_-_File_Transfer_and_Remote_File_Access.pdf	# **Lecture 8: File Transfer and Remote File Access**  \n**Course: BITS 2513 Internet Technology**  \n\n## **File Transfer**  \n- Many programs use the **disk file paradigm** for I/O.  \n- Moving files between computers historically required **removable media** (e.g., tapes, floppies) and **sneakernet**.  \n- Networks enable **direct communication** for file transfer.  \n- **File transfer** is equivalent to transferring files via tape or floppy.  \n- **Remote file system** allows accessing files on networked computers through the same interface as local files.  \n\n## **FTP (File Transfer Protocol)**  \n- Used to **transfer files between computers**.  \n- Follows a **client/server model**.  \n  - **Client**: Accepts user commands and initiates requests to **get** or **put** files on the server.  \n- Defined in **RFC 959**.  \n  - Original version: **RFC 765 (June 1980)**.  \n  - First proposal dates back to **1971**.  \n\n### **How FTP Works**  \n- **User Authentication**:  \n  - FTP server identifies users by **user IDs**.  \n- **Session Creation**:  \n  - FTP client and server establish a session after login.  \n- **File System Access**:  \n  - FTP client can access the **server’s file system**.  \n- **Command Execution**:  \n  - Client issues **character-like commands**.  \n  - Server replies with **numeric codes** interpreted by the client.  \n\n### **FTP Client-Server Interaction**  \n- **FTP Client** (Local Host) ↔ **FTP Server** (Remote Host)  \n- Both can **access their file systems** and transfer files in **either direction**.  \n\n### **Active vs. Passive FTP**  \n- **Active FTP**:  \n  - **Command Channel Setup**:  \n    - User connects from a **random client port** to **port 21** on the server.  \n    - Client sends the **PORT command**, specifying a **client-side port** for the **data channel**.  \n  - **Data Channel Setup**:  \n    - Server connects from **port 20** to the **client-specified port** for data transfer.  \n  - **Server initiates** the data connection.  \n- **Passive FTP**:  \n  - Server specifies a **server-side port** for the data channel.  \n  - **Client initiates** the data connection.  \n- **Most browsers support only passive mode FTP.**  \n\n### **FTP Server Details**  \n- Typically listens on **port 21** for client activity.  \n- Often runs on the same computer as a **Web server**.  \n- Used by web developers to upload changes to web page files.  \n\n### **FTP via Web Browser**  \n- Downloading software via a hyperlink (e.g., "Click here to download") may switch the protocol from `http://` to `ftp://` in the browser's address bar.  \n- Users can log on to an FTP site using a **Web browser**, browse files, change directories, and view file listings.  \n- **Windows Explorer** can also access FTP sites.  \n- Errors occur if attempting to upload files without **write permission**.  \n\n## **Secure FTP (SFTP)**  \n- Stands for **SSH File Transfer Protocol** or **Secure File Transfer Protocol**.  \n- Works similarly to FTP but over a **secure connection**.  \n- **Advantages**:  \n  - Leverages a secure connection for file transfers and filesystem traversal.  \n  - Preferable to FTP due to **security features** and ability to use an **SSH connection**.  \n- **FTP Security Concerns**:  \n  - FTP is **insecure** and should only be used in trusted networks.  \n\n## **Telnet**  \n- Runs on a local computer and connects to a **server** on the network.  \n- Enables users to:  \n  - Create a **remote command console session** on a host.  \n  - Run **command-line programs, shell commands, and scripts** as if locally logged in.  \n\n## **SSH (Secure Shell)**  \n- **Purpose**:  \n  - Enables two computers to establish a **secure, encrypted connection**.  \n  - Helps prevent **password and data sniffing** by attackers.  \n  - Provides secure communication for:  \n    - Email  \n    - Web access  \n    - Remote logins  \n    - File publishing via **SFTP**.  \n- **Security Features**:  \n  - Uses **public-key cryptography** for authentication.  \n  - Ensures **confidentiality and integrity** of data through:  \n    - **Encryption**  \n    - **Message Authentication Codes (MACs)**.  \n- **PuTTY**:  \n  - A free, multiplatform SSH client.	2025-07-10 00:19:37.615969	Internet Technology	File Transfer and Remote File Access	\N
15	1	http://localhost:5000/uploads/1754457923952-407684854-Lecture_11_-_PHPMySQL.pdf	# **PHP Database Connectivity Guide**  \n\n## **1. Introduction**  \n- PHP 5+ supports MySQL via:  \n  - **MySQLi** (Improved MySQL)  \n  - **PDO** (PHP Data Objects)  \n- Older PHP versions used the deprecated **MySQL extension** (removed in 2012).  \n\n## **2. MySQLi vs. PDO**  \n### **PDO Advantages**  \n- Works with **12+ database systems** (portable).  \n- Easier to switch databases (change connection string & queries).  \n- Uses **prepared statements** for security.  \n\n### **MySQLi Advantages**  \n- **Only for MySQL** (not portable).  \n- Offers **procedural & object-oriented** APIs.  \n\n### **Both Support**  \n- **Prepared Statements** (protects against SQL injection).  \n\n## **3. Database Connection Examples**  \n### **MySQLi Procedural**  \n```php  \n<?php  \n$servername = "localhost";  \n$username = "username";  \n$password = "password";  \n\n// Create connection  \n$conn = mysqli_connect($servername, $username, $password);  \n\n// Check connection  \nif (!$conn) {  \n    die("Connection failed: " . mysqli_connect_error());  \n}  \n?>  \n```  \n\n### **MySQLi Object-Oriented**  \n```php  \n$conn = new mysqli($servername, $username, $password);  \nif ($conn->connect_error) {  \n    die("Connection failed: " . $conn->connect_error);  \n}  \n```  \n\n### **PDO (PHP Data Objects)**  \n```php  \ntry {  \n    $conn = new PDO("mysql:host=$servername", $username, $password);  \n    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  \n} catch(PDOException $e) {  \n    die("Connection failed: " . $e->getMessage());  \n}  \n```  \n\n## **4. Database & Table Creation**  \n### **MySQLi Object-Oriented**  \n```php  \n$conn = new mysqli($servername, $username, $password);  \n$sql = "CREATE DATABASE student";  \nif ($conn->query($sql) {  \n    echo "Database created successfully";  \n} else {  \n    echo "Error: " . $conn->error;  \n}  \n$conn->close();  \n```  \n\n### **MySQLi Procedural**  \n```php  \n$conn = mysqli_connect($servername, $username, $password);  \n$sql = "CREATE DATABASE student";  \nif (mysqli_query($conn, $sql)) {  \n    echo "Database created successfully";  \n} else {  \n    echo "Error: " . mysqli_error($conn);  \n}  \nmysqli_close($conn);  \n```  \n\n### **PDO**  \n```php  \ntry {  \n    $conn = new PDO("mysql:host=$servername", $username, $password);  \n    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  \n    $sql = "CREATE DATABASE studentPDO";  \n    $conn->exec($sql);  \n    echo "Database created successfully";  \n} catch(PDOException $e) {  \n    echo $sql . "<br>" . $e->getMessage();  \n}  \n```  \n\n## **5. Table Creation**  \n### **MySQLi Object-Oriented**  \n```php  \n$conn = new mysqli($servername, $username, $password, $dbname);  \n$sql = "CREATE TABLE mytable (name VARCHAR(25), email VARCHAR(25))";  \nif ($conn->query($sql)) {  \n    echo "Table created successfully";  \n} else {  \n    echo "Error: " . $sql . "<br>" . $conn->error;  \n}  \n$conn->close();  \n```  \n\n### **PDO**  \n```php  \ntry {  \n    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);  \n    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  \n    $sql = "CREATE TABLE mytable (name VARCHAR(25), email VARCHAR(25))";  \n    $conn->exec($sql);  \n    echo "Table created successfully";  \n} catch(PDOException $e) {  \n    echo $sql . "<br>" . $e->getMessage();  \n}  \n```  \n\n## **6. CRUD Operations**  \n### **INSERT Data (MySQLi Object-Oriented)**  \n```php  \n$conn = new mysqli($servername, $username, $password, $dbname);  \n$sql = "INSERT INTO myTable (name, email) VALUES ('John', 'john@example.com')";  \nif ($conn->query($sql)) {  \n    echo "Record inserted successfully";  \n} else {  \n    echo "Error: " . $conn->error;  \n}  \n$conn->close();  \n```  \n\n### **SELECT Data (PDO)**  \n```php  \ntry {  \n    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);  \n    $stmt = $conn->prepare("SELECT * FROM myTable");  \n    $stmt->execute();  \n    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);  \n    foreach ($result as $row) {  \n        echo $row['name'] . " - " . $row['email'];  \n    }  \n} catch(PDOException $e) {  \n    echo "Error: " . $e->getMessage();  \n}  \n```  \n\n### **UPDATE Data (MySQLi Procedural)**  \n```php  \n$conn = mysqli_connect($servername, $username, $password, $dbname);  \n$sql = "UPDATE myTable SET name='Nur Aisyah' WHERE email='aisyah@gmail.com'";  \nif (mysqli_query($conn, $sql)) {  \n    echo "Record updated successfully";  \n} else {  \n    echo "Error: " . mysqli_error($conn);  \n}  \nmysqli_close($conn);  \n```  \n\n### **DELETE Data (PDO)**  \n```php  \ntry {  \n    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);  \n    $sql = "DELETE FROM myTable WHERE email='aisyah@gmail.com'";  \n    $conn->exec($sql);  \n    echo "Record deleted successfully";  \n} catch(PDOException $e) {  \n    echo $sql . "<br>" . $e->getMessage();  \n}  \n```  \n\n## **7. Key Takeaways**  \n- **Use PDO** for multi-database support.  \n- **Use MySQLi** for MySQL-only projects (supports procedural style).  \n- **Always use Prepared Statements** for security.  \n- **Error Handling**:  \n  - MySQLi: `$conn->error` (OOP) or `mysqli_error($conn)` (Procedural).  \n  - PDO: Uses `try-catch` with `PDOException`.  \n- **Connection Closure**:  \n  - MySQLi: `$conn->close()` or `mysqli_close($conn)`.  \n  - PDO: Set connection to `null`.  \n\nThis guide covers essential database operations in PHP using **MySQLi** and **PDO**, ensuring secure and efficient database interactions.	2025-08-06 13:29:34.38504	Web Application Development	PHP & MySQL	\N
16	1	http://localhost:5000/uploads/1754470963304-870186013-Lecture_10_-_Peer-to-Peer_Networking.pdf	# **Comprehensive Summary of BITS 2513 Internet Technology Lecture 10: Peer-to-Peer Networking**  \n\n## **1. Introduction to Peer-to-Peer (P2P) Networking**  \n- **Definition**: A distributed networking model where nodes (peers) communicate directly without relying on a central server.  \n- **Key Characteristics**:  \n  - **Decentralization**: No single point of control.  \n  - **Self-scalability**: Performance improves as more peers join.  \n  - **Robustness**: System remains functional even if some peers fail.  \n- **Comparison with Client-Server Model**:  \n  - **Client-Server**: Centralized repository (e.g., MP3.com).  \n  - **P2P**: Files are distributed across peers; direct peer-to-peer transfers.  \n\n## **2. P2P File Sharing Models**  \n\n### **A. Centralized Directory (Napster)**  \n- **Overview**: Uses a central server to maintain a directory of shared files.  \n- **Process Flow**:  \n  1. **Join**: Client connects to the central server.  \n  2. **Publish**: Uploads a list of shared files to the server.  \n  3. **Search**: Queries the server for files; receives peer list.  \n  4. **Fetch**: Directly downloads from the peer.  \n- **Pros**:  \n  - Simple and efficient search.  \n  - Single point of control for definitive answers.  \n- **Cons**:  \n  - Server maintains state of all peers (scalability issue).  \n  - Single point of failure (if server goes down, Napster fails).  \n\n### **B. Query Flooding (Gnutella)**  \n- **Overview**: Fully decentralized; queries propagate through peers.  \n- **Process Flow**:  \n  1. **Join**: Client connects to at least one node (neighbor).  \n  2. **Search**:  \n     - Query is sent to neighbors.  \n     - If no answer, neighbors forward the query (flooding).  \n     - Reply is sent back to the requester.  \n  3. **Fetch**: Direct download from the peer hosting the file.  \n- **Overlay Network**:  \n  - Virtual network formed by peer connections.  \n  - Neighbors may not be physically close.  \n- **Pros**:  \n  - No central control (resistant to shutdown).  \n  - Open protocol.  \n- **Cons**:  \n  - Flooding is inefficient (high network traffic).  \n  - Well-known nodes may become congested.  \n  - System performance degrades if peers leave.  \n\n### **C. Decentralized Directory (Kazaa/FastTrack)**  \n- **Hybrid Model**: Combines aspects of centralized and decentralized approaches.  \n- **Supernodes**:  \n  - High-capacity peers act as mini-directories.  \n  - Reduce flooding by indexing nearby peers.  \n\n### **D. BitTorrent**  \n- **Background**: Introduced in 2002 by Bram Cohen to handle "flash crowds" (sudden high demand).  \n- **Key Idea**:  \n  - Peers download and upload simultaneously ("tit-for-tat" incentive).  \n  - Files are split into chunks for parallel downloading.  \n- **Process Flow**:  \n  - **Publishing**:  \n    1. Create a `.torrent` file (metadata + tracker address).  \n    2. Seed node hosts the full file.  \n    3. Tracker manages peer connections.  \n  - **Downloading**:  \n    1. Obtain `.torrent` file.  \n    2. Contact tracker for peer list.  \n    3. Download chunks from multiple peers.  \n- **Pros**:  \n  - Highly scalable with many peers.  \n  - Incentivizes sharing (better download speeds for uploaders).  \n- **Cons**:  \n  - No built-in search (relies on external torrent indexes).  \n  - Requires large files for efficiency.  \n  - Rare files may have poor availability.  \n\n## **3. Applications of P2P Technologies**  \n- **Diverse Uses**:  \n  - **Cooperative Computing** (e.g., Folding@home).  \n  - **Communications** (e.g., Skype).  \n  - **Digital Currency** (e.g., Bitcoin).  \n  - **DNS & Multicast DNS**.  \n  - **Content Distribution** (e.g., BitTorrent).  \n  - **Distributed Storage**.  \n\n## **4. Other P2P File Sharing Services**  \n- Examples:  \n  - eDonkey/Overnet  \n  - Shareaza  \n  - LimeWire  \n  - eMule  \n  - Ares  \n  - BearShare  \n\n## **5. Summary of Key Takeaways**  \n- **P2P vs. Client-Server**:  \n  - P2P is decentralized, scalable, and robust.  \n  - Client-server relies on a central repository.  \n- **P2P Architectures**:  \n  - **Centralized Directory** (Napster): Simple but single point of failure.  \n  - **Query Flooding** (Gnutella): Fully decentralized but inefficient.  \n  - **Hybrid** (Kazaa): Uses supernodes for efficiency.  \n  - **BitTorrent**: Optimized for large-scale file distribution.  \n- **P2P Dominance**: Accounts for a significant portion of Internet traffic.  \n\nThis summary preserves all key concepts, definitions, and comparisons while maintaining logical flow and readability.	2025-08-06 17:04:25.24404	Internet Technology	Peer-to-Peer Networking	f735d1bf4ca8b0bff6f5b9aefca74628c5200f6a5edf962346aef179ec2189f7
\.


--
-- TOC entry 4959 (class 0 OID 24799)
-- Dependencies: 226
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (id, quiz_score_id, question_text, option_a, option_b, option_c, option_d, correct_answer) FROM stdin;
1	1	What is a characteristic of client-server architecture?	Platform-dependent	Location transparency	Limited scalability	Single-tier processing	B
2	1	Which of the following is NOT a type of server?	File server	Database server	Router server	Print server	C
3	1	What does horizontal scalability in client-server systems refer to?	Upgrading to larger servers	Adding/removing client workstations	Increasing CPU speed	Reducing network latency	B
4	1	Which layer in the logical tiers of application software handles user input?	Application Logic	Database Logic	Presentation Logic	Network Logic	C
5	1	What is a key benefit of thin clients?	High multimedia performance	Lower security risks	No server dependency	Higher Total Cost of Ownership (TCO)	B
6	1	Which protocol is used by directory servers?	HTTP	FTP	LDAP	SMTP	C
7	1	What is the primary role of a mirrored server?	Storing frequently accessed data	Providing fault tolerance	Managing print jobs	Hosting web pages	B
8	1	In a 3-tier architecture, which tier processes requests using database servers?	Clients	Application Servers	Database Servers	Presentation Servers	B
9	1	Which of the following is an example of a web client?	Apache	Microsoft IIS	Firefox	Nginx	C
10	1	What is a disadvantage of N-tier architecture?	Limited scalability	Increased complexity in development	Reduced security	Lower performance	B
11	1	What is the purpose of a cache server?	To store exact replicas of primary servers	To improve performance by storing frequently accessed data	To manage SQL requests	To synchronize network resources	B
12	1	Which of the following is a benefit of virtual hosting?	Supports multiple domains on a single server	Increases server dependency	Reduces file sharing capabilities	Limits printer access	A
13	1	What is a fat client?	A device with minimal server dependence	A server with high processing power	A thin client with limited functionality	A mirrored server	A
14	1	Which of the following is NOT a popular web server?	Apache	Microsoft IIS	Chrome	Tomcat	C
15	1	What does the Internet Printing Protocol (IPP) allow?	Printing over LANs/internet	File sharing across networks	Database synchronization	Web page caching	A
16	1	What is a key feature of directory servers?	Load balancing	Data replication	High multimedia performance	Reduced security risks	B
17	1	In client-server architecture, what does the server provide?	Requests	Services	User interfaces	Network protocols	B
18	1	Which tier in logical layers manages data storage and retrieval?	Presentation Logic	Application Logic	Database Logic	Network Logic	C
19	1	What is a drawback of thin clients?	High security risks	Server dependency	High Total Cost of Ownership (TCO)	Limited scalability	B
20	1	Which of the following is an example of a transaction server application?	Online gaming	Batch processing	Video streaming	File sharing	B
21	2	What is a key characteristic of Peer-to-Peer (P2P) networking?	Centralized control	Self-scalability	Single point of failure	Reliance on a central server	B
22	2	Which P2P model uses a central server to maintain a directory of shared files?	Query Flooding (Gnutella)	Decentralized Directory (Kazaa)	Centralized Directory (Napster)	BitTorrent	C
23	2	What is a major disadvantage of the Query Flooding (Gnutella) model?	Single point of failure	High network traffic due to flooding	Requires a central server	Poor scalability with more peers	B
24	2	In the BitTorrent model, what is the purpose of a `.torrent` file?	It acts as a central directory for peers	It contains metadata and the tracker address	It replaces the need for a peer list	It encrypts the downloaded file	B
25	2	What role do "supernodes" play in the Decentralized Directory (Kazaa) model?	They act as central servers	They index nearby peers to reduce flooding	They enforce download limits	They host all shared files	B
26	2	Which of the following is NOT an application of P2P technologies?	Cooperative Computing (e.g., Folding@home)	Digital Currency (e.g., Bitcoin)	Centralized Web Hosting	Content Distribution (e.g., BitTorrent)	C
27	2	What is a key advantage of the BitTorrent model?	Built-in search functionality	Incentivizes sharing through "tit-for-tat"	No need for a tracker	Works best with small files	B
28	2	Which P2P model is fully decentralized but suffers from inefficiency due to query flooding?	Napster	Gnutella	Kazaa	BitTorrent	B
29	2	What is a major drawback of the Centralized Directory (Napster) model?	No single point of control	High network traffic	Single point of failure	Requires supernodes	C
30	2	Which of the following is a hybrid P2P model that uses supernodes?	Napster	Gnutella	Kazaa	BitTorrent	C
31	3	Which PHP extension was deprecated and removed in 2012?	MySQLi	PDO	MySQL extension	SQLite	C
32	3	How many database systems does PDO support?	1	5	12+	Only MySQL	C
33	3	Which of the following is an advantage of MySQLi over PDO?	Works with 12+ database systems	Offers procedural and object-oriented APIs	Easier to switch databases	Uses prepared statements	B
34	3	What is the correct way to check a connection error in MySQLi procedural style?	`if (!$conn)`	`if ($conn->connect_error)`	`if (mysqli_connect_error())`	`if (PDOException)`	A
35	3	Which method is used to create a database in PDO?	`query()`	`exec()`	`create()`	`connect()`	B
36	3	What is the correct syntax for creating a table using MySQLi object-oriented style?	`$conn->exec($sql)`	`$conn->query($sql)`	`mysqli_query($conn, $sql)`	`PDO::exec($sql)`	B
37	3	How do you handle errors in PDO?	Using `$conn->error`	Using `mysqli_error($conn)`	Using `try-catch` with `PDOException`	Using `die()`	C
38	3	Which of the following is a key takeaway for database security?	Always use procedural style	Always use prepared statements	Always use MySQLi	Always use PDO	B
39	3	What is the correct way to close a MySQLi connection in object-oriented style?	`$conn->close()`	`mysqli_close($conn)`	`$conn = null`	`PDO::close()`	A
40	3	Which method is used to fetch all results in PDO?	`fetchAll(PDO::FETCH_ASSOC)`	`fetch()`	`getAll()`	`queryAll()`	A
\.


--
-- TOC entry 4957 (class 0 OID 24764)
-- Dependencies: 224
-- Data for Name: quiz_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_scores (id, user_id, note_id, difficulty, correct_answers, total_questions, created_at) FROM stdin;
1	1	1	medium	16	20	2025-07-04 00:10:56.547359
2	1	16	medium	0	10	2025-08-08 13:09:19.690477
3	1	15	medium	4	10	2025-08-08 14:51:53.042632
\.


--
-- TOC entry 4955 (class 0 OID 24618)
-- Dependencies: 222
-- Data for Name: saved_notes; Type: TABLE DATA; Schema: public; Owner: fyp_user
--

COPY public.saved_notes (id, user_id, note_id, saved_at) FROM stdin;
\.


--
-- TOC entry 4961 (class 0 OID 24813)
-- Dependencies: 228
-- Data for Name: user_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_answers (id, quiz_question_id, user_selected_option, is_correct) FROM stdin;
1	1	A	f
2	2	C	t
3	3	B	t
4	4	A	f
5	5	B	t
6	6	C	t
7	7	B	t
8	8	C	f
9	9	C	t
10	10	B	t
11	11	B	t
12	12	A	t
13	13	A	t
14	14	C	t
15	15	A	t
16	16	B	t
17	17	B	t
18	18	C	t
19	19	B	t
20	20	A	f
21	21	\N	f
22	22	\N	f
23	23	\N	f
24	24	\N	f
25	25	\N	f
26	26	\N	f
27	27	\N	f
28	28	\N	f
29	29	\N	f
30	30	\N	f
31	31	B	f
32	32	C	t
33	33	B	t
34	34	A	t
35	35	C	f
36	36	D	f
37	37	A	f
38	38	D	f
39	39	A	t
40	40	B	f
\.


--
-- TOC entry 4951 (class 0 OID 16392)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fyp_user
--

COPY public.users (id, username, email, password, created_at) FROM stdin;
1	irfansyafie	irfansyafie96@gmail.com	$2b$10$pi30FtIUaHE87ph0XQFlTu8nXKof2sw7e8.6eo1aP2dAQVJeXvrQW	2025-04-24 01:27:42.578307
3	natasya	lizanuralyaa@gmail.com	$2b$10$LQk9DTlIcWFQYufF/b0a6.JQazCSB1BTTgJ3wOBl8NCNm1ivs1pS.	2025-05-03 16:33:23.172721
4	aimansyahmi	aimansyahmi@gmail.com	$2b$10$6p77DEBh/mfe/fQAGdDUpOiIDxLU3n.JbD.jlq6ZxmXP.eAKCsZm.	2025-06-18 16:41:20.998298
5	zafrinizham	zafrinizham@gmail.com	$2b$10$uv8TQzXHY/IA2JgVk15tg.4TJXI4Ed7wLIHvP1p29Uq1igoaQSBMK	2025-06-19 22:22:42.911768
9	alifaiman	alifaiman@gmail.com	$2b$10$zIc5U/YD070rgoTQfEgE9.n7IY2IYiOYoai4oc6abBkAo7HLcUMRm	2025-06-24 08:43:54.810035
2	sidekali	cdekhebat@gmail.com	$2b$10$rWD4daIoGl4u4r0Z3UObzejN1N8/mI9ouXuIOcpaVYHnffCDcdXNy	2025-04-27 21:14:31.661997
10	sidekhebat	sidek@gmail.com	$2b$10$X1u3NBKtCeUmT59BZYg.XOT1hTfXMetz0KhgcmQnTlie3jFmBKmhG	2025-08-08 20:08:11.956083
11	irzzansyahie	irzzansyahir@gmail.com	$2b$10$WZx95n.VzWw/MYxSBDGEW.Val2MzbIYcHcrrrRQd4kuqcX4un1saq	2025-08-08 20:09:53.755585
\.


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 219
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fyp_user
--

SELECT pg_catalog.setval('public.notes_id_seq', 16, true);


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 225
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 40, true);


--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 223
-- Name: quiz_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_scores_id_seq', 3, true);


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 221
-- Name: saved_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fyp_user
--

SELECT pg_catalog.setval('public.saved_notes_id_seq', 1, true);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 227
-- Name: user_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_answers_id_seq', 40, true);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fyp_user
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- TOC entry 4785 (class 2606 OID 41339)
-- Name: notes notes_file_hash_key; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_file_hash_key UNIQUE (file_hash);


--
-- TOC entry 4787 (class 2606 OID 16417)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 24806)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 24772)
-- Name: quiz_scores quiz_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_scores
    ADD CONSTRAINT quiz_scores_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 24624)
-- Name: saved_notes saved_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 24626)
-- Name: saved_notes saved_notes_user_id_note_id_key; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_user_id_note_id_key UNIQUE (user_id, note_id);


--
-- TOC entry 4797 (class 2606 OID 24820)
-- Name: user_answers user_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 16402)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4781 (class 2606 OID 16398)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 16400)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4798 (class 2606 OID 16418)
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4803 (class 2606 OID 24807)
-- Name: quiz_questions quiz_questions_quiz_score_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_score_id_fkey FOREIGN KEY (quiz_score_id) REFERENCES public.quiz_scores(id) ON DELETE CASCADE;


--
-- TOC entry 4801 (class 2606 OID 24778)
-- Name: quiz_scores quiz_scores_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_scores
    ADD CONSTRAINT quiz_scores_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id);


--
-- TOC entry 4802 (class 2606 OID 24773)
-- Name: quiz_scores quiz_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_scores
    ADD CONSTRAINT quiz_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4799 (class 2606 OID 24632)
-- Name: saved_notes saved_notes_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id);


--
-- TOC entry 4800 (class 2606 OID 24627)
-- Name: saved_notes saved_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fyp_user
--

ALTER TABLE ONLY public.saved_notes
    ADD CONSTRAINT saved_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4804 (class 2606 OID 24821)
-- Name: user_answers user_answers_quiz_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_quiz_question_id_fkey FOREIGN KEY (quiz_question_id) REFERENCES public.quiz_questions(id) ON DELETE CASCADE;


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE quiz_questions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.quiz_questions TO fyp_user;


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE quiz_questions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.quiz_questions_id_seq TO fyp_user;


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE quiz_scores; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.quiz_scores TO fyp_user;


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE quiz_scores_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.quiz_scores_id_seq TO fyp_user;


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE user_answers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_answers TO fyp_user;


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE user_answers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.user_answers_id_seq TO fyp_user;


--
-- TOC entry 2069 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO fyp_user;


-- Completed on 2025-08-08 21:26:13

--
-- PostgreSQL database dump complete
--

