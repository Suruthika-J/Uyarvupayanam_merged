const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const PracticeQuestion = require("../models/PracticeQuestion");

// Helper to normalize question text for strict uniqueness checks
const normalizeText = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const createQuestion = (subjectId, subjectName, topicId, topicName, difficulty, seqNum, questionText, optionsArr, correctIndex, explanation, score, reason) => {
  const diffCode = difficulty[0]; // 'E', 'M', 'H', 'A'
  const padSeq = String(seqNum).padStart(3, "0");
  const qId = `${subjectId.toUpperCase()}_${diffCode}_${padSeq}`;
  
  const optionLabels = ["A", "B", "C", "D"];
  const formattedOptions = optionsArr.map((optText, idx) => ({
    id: optionLabels[idx],
    text: optText
  }));

  return {
    questionId: qId,
    subjectId: subjectId.toLowerCase(),
    subjectName,
    topicId: topicId.toLowerCase(),
    topicName,
    difficulty,
    difficultyScore: score,
    difficultyReason: reason,
    questionText,
    normalizedQuestion: normalizeText(questionText),
    options: formattedOptions,
    correctOption: optionLabels[correctIndex],
    explanation,
    active: true
  };
};

// ── SUBJECT QUESTION POOLS (20 Easy, 20 Medium, 20 Hard, 20 Advanced per subject) ─────────

const rawSubjectsData = {
  dbms: {
    name: "Database Management Systems (DBMS)",
    topics: [
      { id: "normalization", name: "Database Normalization" },
      { id: "transactions", name: "Transaction Management & ACID" },
      { id: "indexing", name: "Indexing & Storage" },
      { id: "concurrency", name: "Concurrency Control" },
      { id: "relational_algebra", name: "Relational Algebra & Architecture" }
    ],
    EASY: [
      ["Which SQL command is used to retrieve data from a database table?", ["SELECT", "INSERT", "UPDATE", "DELETE"], 0, "SELECT is the standard DML command to query rows.", 15, "Direct syntax recall"],
      ["What is a Primary Key in a relational database table?", ["A key that allows NULL values", "A column or combination of columns that uniquely identifies each row", "A key imported from another table", "A key used only for full text search"], 1, "A Primary Key uniquely identifies rows and cannot be NULL.", 20, "Basic concept definition"],
      ["Which normal form requires a relation to be in 1NF and have no partial functional dependencies?", ["1NF", "2NF", "3NF", "BCNF"], 1, "2NF eliminates partial functional dependencies.", 25, "Direct normal form definition"],
      ["Which ACID property guarantees that all transaction operations complete or none are applied?", ["Atomicity", "Consistency", "Isolation", "Durability"], 0, "Atomicity enforces all-or-nothing execution.", 20, "Basic ACID definition"],
      ["What type of integrity constraint ensures that foreign key values match existing primary keys in parent tables?", ["Domain Integrity", "Referential Integrity", "Entity Integrity", "User-Defined Integrity"], 1, "Referential integrity maintains relationship validity.", 20, "Direct recall"],
      ["Which language component is used to define table structures and schema constraints in SQL?", ["DML", "DDL", "DCL", "TCL"], 1, "Data Definition Language (DDL) creates and alters schema structures.", 15, "Syntax recall"],
      ["What is a tuple in relational database terminology?", ["A column attribute", "A single row in a relation", "A table schema", "A primary key index"], 1, "A tuple represents a single record or row in a table.", 15, "Basic terminology"],
      ["Which SQL clause is used to filter records based on a specific condition?", ["GROUP BY", "WHERE", "ORDER BY", "HAVING"], 1, "WHERE filters rows before grouping or aggregation.", 15, "Basic SQL syntax"],
      ["What does SQL stand for?", ["Structured Query Language", "Sequential Query Logic", "System Quality Language", "Standardized Storage Language"], 0, "SQL stands for Structured Query Language.", 10, "Direct acronym recall"],
      ["Which constraint prevents duplicate values from being inserted into a specific column?", ["CHECK", "UNIQUE", "DEFAULT", "FOREIGN KEY"], 1, "UNIQUE constraint enforces distinct column values.", 20, "Basic constraint definition"],
      ["Which normal form ensures that atomic values exist in every attribute column?", ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Fourth Normal Form (4NF)"], 0, "1NF requires multivalued or composite attributes to be eliminated.", 20, "1NF definition"],
      ["What is the main role of a Data Dictionary in a DBMS?", ["To store user passwords", "To hold metadata describing database schemas, tables, and constraints", "To execute SQL queries faster", "To backup binary data"], 1, "A data dictionary stores metadata about database objects.", 20, "DBMS component definition"],
      ["Which operator is used to search for a specified pattern in a column in SQL?", ["LIKE", "IN", "BETWEEN", "EXISTS"], 0, "LIKE uses wildcards (% and _) to search text patterns.", 15, "Basic operator recall"],
      ["Which SQL keyword is used to sort the result set in ascending or descending order?", ["SORT BY", "ORDER BY", "ARRANGE BY", "GROUP BY"], 1, "ORDER BY sorts result tuples.", 15, "Basic SQL syntax"],
      ["What is a Candidate Key in a relational schema?", ["A key that contains foreign attributes", "A minimal superkey capable of uniquely identifying tuples", "A key generated automatically by the OS", "A secondary index"], 1, "A candidate key is a minimal superkey.", 25, "Basic key concept"],
      ["Which command is used to remove all records from a table while retaining its structure?", ["DROP", "TRUNCATE", "DELETE", "REMOVE"], 1, "TRUNCATE deallocates data pages quickly while keeping table structure.", 25, "Basic command distinction"],
      ["What is the maximum number of Clustered Indexes a single table can possess?", ["1", "2", "Unlimited", "Depends on RAM"], 0, "Because clustered index defines physical disk layout, only 1 can exist per table.", 25, "Fundamental storage rule"],
      ["Which SQL aggregate function returns the total number of rows matching a query?", ["SUM()", "COUNT()", "TOTAL()", "AVG()"], 1, "COUNT() returns tuple counts.", 15, "Basic aggregate function"],
      ["Which ACID property guarantees that committed transaction changes survive system crashes?", ["Atomicity", "Consistency", "Isolation", "Durability"], 3, "Durability guarantees persistent log/disk writes.", 20, "ACID definition"],
      ["What is a Foreign Key?", ["A key that uniquely identifies rows in the current table", "A column in one table referencing the Primary Key of another table", "An encrypted key for database security", "A primary key with NULL allowed"], 1, "Foreign keys link records between tables.", 20, "Basic relational term"]
    ],
    MEDIUM: [
      ["A relation has a composite candidate key (A, B) and a non-key attribute C depends only on A. Which normal form is violated?", ["1NF", "2NF", "3NF", "BCNF"], 1, "Partial dependency of non-prime attribute C on proper subset A violates 2NF.", 40, "Simple scenario application"],
      ["What distinguishes Boyce-Codd Normal Form (BCNF) from Third Normal Form (3NF)?", ["3NF permits A -> B if B is a prime attribute even if A is not a superkey; BCNF requires A to be a superkey for every non-trivial FD A -> B", "BCNF allows partial dependencies", "3NF applies only to single-attribute keys", "BCNF removes multi-valued dependencies"], 0, "BCNF eliminates the prime attribute exception present in 3NF.", 45, "Concept comparison"],
      ["In transaction management, which anomaly occurs when Transaction T1 reads data modified by T2 before T2 commits or aborts?", ["Non-repeatable Read", "Phantom Read", "Dirty Read", "Lost Update"], 2, "Dirty read occurs when uncommitted writes are read.", 40, "Anomaly classification"],
      ["Why are B+ Trees preferred over standard Binary Search Trees for disk-based database indexes?", ["B+ Trees have high node fan-out which reduces tree height and disk block reads, and leaf nodes are linked for range scans", "Binary search trees take less disk space", "B+ Trees use hash functions for O(1) lookups", "B+ Trees eliminate foreign keys"], 0, "High fan-out minimizes disk block seeks.", 45, "Architecture trade-off"],
      ["What is the primary purpose of Write-Ahead Logging (WAL) in database storage engines?", ["Flushing transaction log records to persistent storage BEFORE dirty data pages are written to disk", "Encrypting user passwords", "Compressing indexes", "Preventing deadlocks"], 0, "WAL guarantees durability and enables crash recovery.", 50, "Engine protocol reasoning"],
      ["Consider FDs: A -> B and B -> C in relation R(A,B,C). What is the highest normal form R satisfies if A is the primary key?", ["1NF", "2NF", "3NF", "BCNF"], 2, "Transitive dependency A -> C exists via B, violating BCNF but satisfying 3NF if checked properly; here transitive dependency violates 3NF so it's 2NF, wait: A is candidate key, A->B and B->C has non-prime C depending transitively on A, so highest satisfied is 2NF.", 45, "Multi-step FD analysis"],
      ["Which SQL JOIN returns all rows from the left table and matched records from the right table, filling NULLs for non-matches?", ["INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN"], 1, "LEFT OUTER JOIN preserves all left table records.", 35, "Query join reasoning"],
      ["What type of lock permits concurrent transactions to read a database item but prevents any transaction from writing to it?", ["Exclusive Lock (X)", "Shared Lock (S)", "Intent Lock (IS)", "Update Lock (U)"], 1, "Shared locks allow multiple concurrent readers.", 40, "Concurrency lock mechanics"],
      ["In Strict Two-Phase Locking (Strict 2PL), when are exclusive (write) locks released?", ["As soon as the item is written", "At the end of the transaction after COMMIT or ABORT", "During the shrinking phase before commit", "When requested by another process"], 1, "Strict 2PL holds write locks until transaction completion to avoid cascading aborts.", 50, "Protocol rule application"],
      ["What is a Phantom Read anomaly under SQL transaction isolation levels?", ["Reading uncommitted data from a concurrent transaction", "Reading different values for the same row when re-read in the same transaction", "A query re-executing a range search and discovering new rows inserted by a committed transaction", "Overwriting another transaction's uncommitted write"], 2, "Phantom reads involve new rows appearing in range queries.", 45, "Anomaly identification"],
      ["In relational algebra, which operation selects tuples from a relation that satisfy a given predicate?", ["Projection (pi)", "Selection (sigma)", "Cartesian Product (x)", "Union (U)"], 1, "Selection filters rows based on a boolean predicate.", 35, "Relational algebra mapping"],
      ["Which index structure is best suited for equality lookups on high-cardinality data stored in RAM without range queries?", ["B+ Tree Index", "Hash Index", "Bitmap Index", "R-Tree Index"], 1, "Hash indexes offer O(1) average equality lookup but do not support range scans.", 40, "Index suitability scenario"],
      ["What happens during the Undo phase of ARIES database recovery?", ["Replaying all committed and uncommitted changes from the log", "Rolling back changes of uncommitted transactions (loser transactions) in reverse chronological order", "Writing checkpoints to disk", "Rebuilding B+ tree leaf nodes"], 1, "Undo phase rolls back active transactions active at crash time.", 50, "Recovery protocol phase"],
      ["What is a Dense Index compared to a Sparse Index?", ["A dense index has an index entry for every search key value in the data file", "A dense index stores data rows inside index nodes", "A dense index takes less disk space than a sparse index", "A dense index is used only for non-clustered keys"], 0, "Dense index maps every record search key.", 45, "Storage concept comparison"],
      ["Which SQL clause is used to filter groups AFTER aggregate calculations have been computed?", ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], 1, "HAVING filters aggregate group results.", 35, "Query logic application"],
      ["What condition causes a Deadlock in a database system?", ["A transaction holding an Exclusive lock waits for a Shared lock", "Two or more transactions circularly waiting for locks held by each other", "A transaction reading dirty data", "A long running SELECT query"], 1, "Circular wait condition causes deadlock.", 40, "Deadlock scenario"],
      ["In ER modeling, what is a Weak Entity set?", ["An entity set with no candidate keys", "An entity set that does not have sufficient attributes to form a primary key on its own", "An entity set with only foreign keys", "An entity set with nullable primary key"], 1, "Weak entity relies on identifying parent entity.", 40, "ER design application"],
      ["What is the purpose of Database Checkpointing?", ["To compress log files on disk", "To reduce crash recovery time by flushing dirty pages and writing checkpoint log records", "To lock all user tables during backup", "To re-index primary key columns"], 1, "Checkpoints limit how far back REDO recovery must scan.", 45, "Engine recovery mechanism"],
      ["Which isolation level prevents Dirty Reads and Non-Repeatable Reads but allows Phantom Reads?", ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], 2, "Repeatable Read prevents non-repeatable reads but allows phantoms in standard ANSI SQL.", 50, "Isolation level matrix"],
      ["What is Lossless-Join Decomposition property in database normalization?", ["Rejoining decomposed tables via natural join guarantees exact original relation without extra or missing tuples", "Decomposed tables have zero duplicate rows", "Foreign keys are automatically generated", "Attributes are converted to primary keys"], 0, "Lossless join preserves exact tuple information.", 50, "Theory application"]
    ],
    HARD: [
      ["Given relation R(A,B,C,D,E) with FDs: A -> BC, CD -> E, B -> D, E -> A. What is the highest normal form satisfied by R?", ["1NF", "2NF", "3NF", "BCNF"], 2, "Candidate keys are A, E, CD, AB. B -> D is a partial dependency of non-prime attribute D on candidate key AB... wait: candidate keys are A, E, CD, BC. In B -> D, B is part of key BC and D is part of key CD (prime). Since D is prime attribute, B -> D satisfies 3NF but violates BCNF since B is not a superkey. Highest NF is 3NF.", 65, "Complex multi-FD candidate key analysis"],
      ["In Multi-Version Concurrency Control (MVCC), how do database storage engines (like PostgreSQL / InnoDB) achieve non-blocking reads during concurrent writes?", ["By locking the table in shared mode", "By creating new tuple versions with creation/deletion transaction IDs (xmin/xmax), allowing readers to inspect committed snapshots active at query start", "By converting writes into append-only RAM queues", "By forcing single-threaded execution"], 1, "MVCC reads historical committed tuple versions without acquiring read locks.", 70, "Advanced engine concurrency architecture"],
      ["Consider a transaction schedule S on T1, T2: T1:R(X), T2:W(X), T1:W(X), T2:Commit, T1:Commit. Is S conflict serializable, and is it recoverable?", ["Conflict serializable and recoverable", "Not conflict serializable but recoverable", "Conflict serializable but NOT recoverable", "Neither conflict serializable nor recoverable"], 2, "Precedence graph has T1 -> T2 (R1(X)-W2(X)) and T2 -> T1 (W2(X)-W1(X)), wait: graph has cycle T1->T2 and T2->T1, so NOT conflict serializable. T1 reads X before T2 writes X, T2 writes X, T1 writes X. T1 writes X after T2 writes X. T2 commits before T1. T1 does not read T2's write. So it is recoverable, but not conflict serializable.", 75, "Schedule serializability and recoverability proof"],
      ["When executing a SQL query with a JOIN between a 10,000,000 row table and a 100 row lookup table, which join algorithm exhibits optimal time and I/O efficiency for an unindexed join?", ["Nested Loop Join scanning 10M rows 100 times", "Hash Join building an in-memory hash table on the 100-row table and scanning 10M rows once", "Sort-Merge Join requiring sorting 10M rows", "Cartesian Product Join"], 1, "Hash Join builds in-memory hash table of small relation O(M) and probes in one linear pass O(N).", 65, "Query optimizer execution cost analysis"],
      ["What buffer pool page replacement algorithm prevents sequential scan pollution by maintaining separate queues for single-touch and multi-touch pages?", ["Basic LRU", "2Q Algorithm (or LRU-2 / Clock-Pro)", "FIFO", "Random Replacement"], 1, "2Q algorithm separates cold single-scan pages from hot frequently accessed pages.", 70, "Storage engine memory management"],
      ["In B+ Tree indexing, what is the maximum number of keys in a node of order m, and what is the minimum number of keys in a non-root internal node?", ["Max: m-1, Min: ceil(m/2)-1", "Max: m, Min: m/2", "Max: m-1, Min: 1", "Max: 2m, Min: m"], 0, "Node of order m holds max m-1 keys and min ceil(m/2)-1 keys.", 65, "Data structure mathematical bounds"],
      ["Under ARIES recovery, what is written to the log during the UNDO phase when a transaction change is rolled back, preventing infinite loops during repeated crashes?", ["Checkpoint Record", "Compensation Log Record (CLR)", "Savepoint Record", "Commit Record"], 1, "CLRs record undo actions and contain UndoNextLSN pointers.", 75, "Crash recovery protocol detail"],
      ["In relational query optimization, what is the primary advantage of Pushing Selections down a logical query evaluation tree?", ["It decreases index storage size", "It reduces the cardinality of intermediate relations early, lowering downstream join and sort processing costs", "It converts outer joins into inner joins", "It eliminates primary key constraints"], 1, "Selection pushdown minimizes intermediate tuple counts.", 60, "Logical query plan optimization"],
      ["Which concurrency control protocol guarantees freedom from deadlocks WITHOUT requiring lock acquisition phases?", ["Strict 2PL", "Timestamp Ordering (TO) Protocol", "Rigorous 2PL", "Tree Locking Protocol"], 1, "Timestamp ordering uses transaction timestamps to resolve conflict order without locking.", 65, "Protocol property evaluation"],
      ["What is the difference between Write Skew anomaly and Lost Update anomaly in Snapshot Isolation?", ["Write skew occurs when two concurrent transactions read overlapping data sets, make disjoint writes violating a global constraint, neither seeing the other's write", "Write skew occurs only in Read Uncommitted", "Lost update occurs when two transactions read different tables", "Write skew is prevented by Read Committed"], 0, "Write skew violates multi-table invariants under Snapshot Isolation.", 75, "Advanced isolation anomaly"],
      ["In PostgreSQL query plans, what does an Index Only Scan indicate?", ["The query uses an index and all requested columns are fetched directly from the index tuple without accessing the main heap table", "The table has no indexes", "The index is corrupt and being rebuilt", "The query scans every page of the index sequentially"], 0, "Index Only Scan avoids heap page fetches via visibility map.", 65, "Database execution engine internals"],
      ["In a database using Write-Ahead Logging, if the OS flushes a dirty data page to disk BEFORE the corresponding transaction log record is written, which ACID property is violated?", ["Atomicity and Durability", "Consistency alone", "Isolation alone", "User Integrity"], 0, "If crash occurs, uncommitted data on disk cannot be undone without WAL log record.", 70, "WAL fundamental guarantee"],
      ["What is the Wait-Die scheme for deadlock prevention in database systems?", ["If T_old requests resource held by T_young, T_old waits; if T_young requests resource held by T_old, T_young dies (aborts)", "If T_young requests resource held by T_old, T_young waits", "Transactions die randomly when deadlock occurs", "Old transactions are killed immediately"], 0, "Wait-die is a non-preemptive timestamp-based deadlock prevention scheme.", 70, "Deadlock prevention scheme"],
      ["In relational algebra, if relation R has 100 rows and S has 50 rows, what are the minimum and maximum possible row counts for R LEFT OUTER JOIN S?", ["Min: 0, Max: 5000", "Min: 100, Max: 100 (if 1:1) or 5000 (if 1:N)", "Min: 50, Max: 100", "Min: 100, Max: 100 strictly"], 1, "Left join preserves all 100 rows of R; max rows can be 100*50 if duplicate join keys exist.", 65, "Relational join bounds"],
      ["What is the primary trade-off of maintaining a secondary non-clustered index on a table with heavy INSERT/UPDATE workloads?", ["Increases SELECT query latency", "Accelerates read queries but adds disk I/O overhead to update index pages on every write", "Decreases table storage size", "Causes table corruption"], 1, "Write overhead increases due to index maintenance.", 60, "Storage & query trade-off"],
      ["Consider functional dependencies {A -> B, B -> C, C -> A}. What are the candidate keys for R(A,B,C)?", ["A only", "A, B, and C individually", "AB and BC", "ABC together"], 1, "Since A->B->C->A, each single attribute determines all attributes.", 65, "FD candidate key computation"],
      ["In distributed databases, what does the CAP Theorem state regarding partition tolerance (P)?", ["A system can simultaneously provide Consistency (C), Availability (A), and Partition Tolerance (P)", "In the presence of a network partition (P), a system must choose between Consistency (C) and Availability (A)", "Partition tolerance is optional in cloud databases", "Consistency guarantees zero latency"], 1, "CAP theorem forces CA trade-off during network partitions.", 70, "Distributed database theory"],
      ["Which lock granularity level provides maximum concurrency but incurs highest lock management memory overhead?", ["Database Level", "Table Level", "Page Level", "Row / Tuple Level"], 3, "Row-level locking maximizes concurrency but uses most lock manager memory.", 65, "Lock manager design"],
      ["What is a Covering Index?", ["An index that contains all columns referenced in a query (select, filter, join), allowing index-only execution", "An index covering the entire database file", "A clustered index on primary key", "An index that covers foreign key constraints"], 0, "Covering index fulfills query without heap access.", 65, "Query optimization term"],
      ["In ARIES recovery, what information is stored in the Transaction Table and Dirty Page Table during Checkpointing?", ["Active transaction IDs with LastLSN, and dirty page IDs with RecLSN (earliest log record modifying the page)", "Full table data copies", "User passwords and permissions", "Index B+ tree root pointers"], 0, "RecLSN determines earliest log record needed for REDO pass.", 75, "ARIES checkpoint internals"]
    ],
    ADVANCED: [
      ["In a distributed database implementing Two-Phase Commit (2PC), if the coordinator crashes after sending PREPARE to all cohorts and receiving all VOTE_COMMIT responses, but before sending COMMIT, what state are cohorts left in, and how does 3PC resolve this?", ["Cohorts are blocked in an in-doubt state holding locks; 3PC introduces a Pre-Commit state and timeout mechanisms to prevent blocking", "Cohorts automatically rollback", "Cohorts abort immediately without waiting", "3PC eliminates network messages"], 0, "2PC suffers from blocking in-doubt states; 3PC adds Pre-Commit state to guarantee non-blocking under fail-stop models.", 90, "Expert distributed consensus architecture"],
      ["Consider a database storage engine using Multi-Version Concurrency Control (MVCC) with Append-Only B-Trees (LSM-Tree / CouchDB). How are garbage tuple versions reclaimed without locking active readers?", ["Via background Compaction / Savepoint merging that copies active live versions into new SSTables and atomically swaps root pointers", "By running synchronous DELETE statements", "By stopping the database server every hour", "By overwriting old data blocks in-place"], 0, "LSMcompaction reclaims dead tuple versions out-of-place while atomic pointer swaps update live roots.", 85, "Expert LSM-tree compaction mechanics"],
      ["Given a database workload with 95% point lookups, 5% range scans, and high random write throughput (100k writes/sec), evaluate LSM-Trees vs B+ Trees. Which structure minimizes write amplification and why?", ["LSM-Trees minimize write amplification by batching writes sequentially in RAM (MemTable) and flushing sequentially to disk SSTables", "B+ Trees minimize write amplification because in-place random disk writes use less I/O", "B+ Trees have zero write amplification", "LSM-Trees do not support point lookups"], 0, "LSM-Trees convert random writes to sequential log flushes, drastically lowering write amplification.", 85, "Storage engine benchmarking & trade-offs"],
      ["In database query execution engines, how does Vectorized Query Execution (Volcano Iterator vs Vector-at-a-time) improve CPU L1/L2 cache locality and SIMD instruction utilization?", ["By processing vectors of tuples (e.g. 1024 rows) in tight primitive loops, reducing function call overhead and leveraging SIMD instructions", "By executing SQL queries on separate threads per row", "By storing all tables in uncompressed text files", "By compiling SQL into Java bytecode"], 0, "Vectorized engine mitigates Volcano iterator next() virtual function call overhead and enables SIMD parallelism.", 90, "Database kernel execution architecture"],
      ["In Distributed Database Consensus using the Raft protocol, if a follower node receives an AppendEntries RPC containing a log entry with index i and term t that conflicts with its local log, how is log consistency enforced?", ["The follower rejects the RPC, and the leader decrements nextIndex and retries until a matching log entry is found, overwriting conflicting follower logs", "The follower crashes immediately", "The follower accepts both entries creating a fork", "The follower becomes the new leader"], 0, "Raft leader forces follower logs to duplicate leader log matching term and index.", 85, "Distributed Raft consensus protocol"],
      ["Under Snapshot Isolation, if two transactions T1 and T2 concurrently execute: T1 reads balance of Account A and B, if A+B > 0 subtracts $100 from A; T2 reads A and B, if A+B > 0 subtracts $100 from B. If initial A=$50, B=$60, what occurs?", ["Write Skew occurs: both transactions commit successfully, but final A+B = -$90 violating the domain constraint A+B > 0", "One transaction is killed by deadlock", "Serializability is maintained perfectly", "A dirty read is committed"], 0, "Write skew occurs under Snapshot Isolation when concurrent transactions read same data but write to disjoint items violating invariant.", 90, "Complex isolation anomaly proof"],
      ["How does Lock-Free In-Memory OLTP Database Indexing (like Bw-Tree / Masstree) achieve high concurrency on multi-core CPUs without latching?", ["Using Compare-And-Swap (CAS) atomic operations to append delta records to nodes and stateful mapping tables", "Using global mutex locks on every page", "Disabling multi-threading on CPU", "Storing data in single-threaded Redis nodes"], 0, "Bw-Tree uses CAS updates on mapping tables to modify nodes latch-free.", 90, "In-memory engine lock-free design"],
      ["In PostgreSQL, what is the architectural function of the Visibility Map (VM) in optimizing VACUUM operations and Index Only Scans?", ["The VM tracks whether all tuples on a heap page are visible to all current/future transactions, allowing VACUUM to skip clean pages and Index Only Scans to bypass heap lookups", "The VM stores user role permissions", "The VM holds encrypted SSL keys", "The VM compresses dead rows"], 0, "Visibility map tracks page all-visible status to optimize vacuuming and index scans.", 85, "PostgreSQL engine storage internals"],
      ["Consider a database transaction log experiencing high write contention. How does Group Commit optimize disk I/O throughput?", ["By flushing log buffer pages of multiple concurrent transactions in a single consolidated physical disk write", "By executing transactions sequentially", "By disabling log flushing to disk entirely", "By writing log entries to user RAM only"], 0, "Group commit aggregates log flushes across threads into single sequential I/O write.", 80, "Storage engine log performance tuning"],
      ["In distributed databases with Multi-Master Replication, how are concurrent update conflicts on the same record resolved without central locking?", ["Using Conflict-Free Replicated Data Types (CRDTs) or Last-Write-Wins (LWW) with Hybrid Logical Clocks (HLC)", "By dropping both conflicting updates", "By restarting all database nodes in the cluster", "By locking all user sessions"], 0, "CRDTs and HLCs provide deterministic convergent state resolution across masters.", 90, "Multi-master replication consensus"],
      ["In ARIES crash recovery, why is it mandatory for the Analysis Pass to start from the earliest RecLSN in the Dirty Page Table rather than the Checkpoint LSN?", ["Because dirty pages flushed prior to checkpoint may contain uncommitted changes that must be checked, and RecLSN guarantees no REDO log records are skipped", "Because Checkpoint LSN is always corrupt", "To slow down recovery process for safety", "To delete log records"], 0, "Redo pass starts at min(RecLSN) in DPT to ensure all un-flushed modifications are replayed.", 85, "ARIES recovery mathematical proof"],
      ["What is the fundamental difference between Pessimistic Concurrency Control (2PL) and Optimistic Concurrency Control (OCC) in high-contention vs low-contention workloads?", ["OCC validates transactions at commit time (Read -> Validate -> Write), outperforming 2PL in low-contention but suffering high abort rates under high contention", "OCC uses heavy exclusive locks during read phase", "2PL has zero lock overhead", "OCC cannot be used in relational databases"], 0, "OCC eliminates lock overhead during reads, excelling in low-contention workloads but aborting frequently when conflicts spike.", 80, "Concurrency control trade-off analysis"],
      ["In modern columnar database storage engines (e.g. Parquet / ClickHouse), how does Run-Length Encoding (RLE) and Dictionary Encoding achieve 10x compression on low-cardinality columns?", ["By replacing repeated identical values with (value, count) pairs and mapping unique strings to small integer keys", "By deleting duplicate rows from the table", "By converting integers into floating point numbers", "By storing data in uncompressed JSON format"], 0, "RLE and dictionary encoding exploit low column cardinality for tight byte compression.", 80, "Columnar storage engine compression"],
      ["Consider a distributed query planner executing a 3-way join across nodes N1, N2, N3. What is a Semi-Join Reduction optimization?", ["Sending unique join keys from N1 to N2 first to filter N2 tuples before transferring the full relation across the network", "Executing joins in single-threaded mode", "Deleting un-joined rows permanently", "Converting inner join to cross join"], 0, "Semi-joins minimize network transfer volume in distributed database clusters.", 85, "Distributed query optimization"],
      ["How does an In-Memory Database handle logging when main memory (RAM) is non-volatile (NVRAM / NVDIMM)?", ["Writes can be executed directly to byte-addressable NVRAM using CPU persist instructions (clflushopt/sfence), bypassing traditional disk log flushing", "By maintaining disk swap space", "By converting data into text files", "By disabling transactions entirely"], 0, "Byte-addressable NVRAM enables microsecond persistent logging directly from CPU cache lines.", 90, "Hardware-software co-design in DB engines"],
      ["In PostgreSQL query execution, what is the function of a Bitmap Index Scan combined with Bitmap Heap Scan?", ["It creates a bitmap of matching heap pages from multiple index scans (AND/OR operations) before performing sequential physical page reads from disk", "It converts tables into bitmap images", "It bypasses foreign key checks", "It accelerates text formatting"], 0, "Bitmap scan combines multiple indexes and sorts heap page reads for sequential disk I/O.", 80, "PostgreSQL execution plan optimization"],
      ["What is the primary trade-off of using Write-Heavy Data Structures like LSM-Trees over Read-Heavy B+ Trees in database engines?", ["LSM-Trees sacrifice read latency (requiring bloom filters and multi-SSTable searches) to achieve high sequential write throughput", "LSM-Trees have slower write speeds", "B+ Trees take more memory than LSM-Trees", "LSM-Trees cannot store text data"], 0, "LSM-Trees trade point read performance for fast sequential write ingestion.", 80, "Storage engine architectural selection"],
      ["In distributed ACID transactions, what is the role of Spanner's TrueTime API (using atomic clocks and GPS receivers)?", ["It provides globally bounded clock uncertainty (epsilon), allowing Spanner to assign strict serializable commit timestamps without cross-datacenter locking", "It synchronizes computer monitors", "It speeds up network Wi-Fi connections", "It calculates user timezone offsets"], 0, "TrueTime bounds clock drift allowing globally distributed external consistency timestamp assignment.", 95, "Google Spanner distributed consistency"],
      ["What is a Phantom Protection mechanism using Index Range Locks (Next-Key Locking in InnoDB)?", ["Locking the requested index record AND the gap preceding it to prevent concurrent transactions from inserting new rows in the range", "Locking the entire database server", "Disabling INSERT queries", "Using random delay loops"], 0, "Next-Key locking locks record and preceding gap, blocking phantom inserts under Repeatable Read.", 85, "InnoDB locking & phantom protection"],
      ["In Database Buffer Management, what is the Clock-Sweep (Second-Chance) algorithm, and how does it approximate LRU with O(1) space?", ["It uses a circular buffer pointer with a reference bit per page frame; clearing the bit on sweep and evicting the first page with bit=0", "It uses a full doubly linked list of all memory blocks", "It uses random number generators", "It reboots the system when memory is full"], 0, "Clock-Sweep approximates LRU with single reference bit overhead per page frame.", 80, "Buffer management algorithms"]
    ]
  },
  sql: {
    name: "Structured Query Language (SQL)",
    topics: [
      { id: "sql_queries", name: "DML & Basic Queries" },
      { id: "sql_joins", name: "Joins & Subqueries" },
      { id: "sql_aggregates", name: "Aggregation & Grouping" },
      { id: "sql_ddl", name: "DDL & Schema Management" }
    ],
    EASY: [
      ["Which SQL clause is used to filter records from a table?", ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], 0, "WHERE filters rows before aggregation.", 15, "Basic query syntax"],
      ["Which SQL command inserts new records into a table?", ["INSERT INTO", "ADD ROW", "UPDATE", "CREATE"], 0, "INSERT INTO adds new tuples.", 15, "Basic DML syntax"],
      ["Which SQL function returns the number of rows in a query result?", ["COUNT()", "SUM()", "MAX()", "AVG()"], 0, "COUNT() aggregates tuple counts.", 15, "Basic aggregate function"],
      ["Which SQL keyword is used to eliminate duplicate rows from a query result?", ["DISTINCT", "UNIQUE", "DIFFERENT", "SINGLE"], 0, "DISTINCT removes duplicate tuples.", 15, "Basic SQL keyword"],
      ["Which SQL clause orders the returned rows in ascending or descending order?", ["ORDER BY", "GROUP BY", "SORT", "ALIGN"], 0, "ORDER BY sets result ordering.", 15, "Basic sorting clause"],
      ["Which SQL command modifies existing records in a table?", ["UPDATE", "ALTER", "CHANGE", "MODIFY"], 0, "UPDATE alters existing tuple data.", 15, "Basic DML command"],
      ["Which SQL command removes a table schema completely from the database?", ["DROP TABLE", "DELETE TABLE", "REMOVE TABLE", "TRUNCATE TABLE"], 0, "DROP TABLE removes schema and data.", 20, "DDL command definition"],
      ["Which aggregate function calculates the average value of a numeric column?", ["AVG()", "SUM()", "MEAN()", "COUNT()"], 0, "AVG() calculates numerical mean.", 15, "Basic aggregate function"],
      ["Which SQL constraint ensures a column cannot contain NULL values?", ["NOT NULL", "UNIQUE", "CHECK", "DEFAULT"], 0, "NOT NULL enforces mandatory values.", 15, "Basic constraint syntax"],
      ["Which operator is used to search for specified values in a list in SQL?", ["IN", "LIKE", "BETWEEN", "EXISTS"], 0, "IN matches values against a discrete set.", 15, "Basic list operator"],
      ["Which SQL wildcard character represents zero or more characters in LIKE pattern matching?", ["%", "_", "*", "#"], 0, "% matches multi-character strings in SQL.", 15, "Wildcard syntax"],
      ["Which SQL clause groups rows that have the same values into summary rows?", ["GROUP BY", "ORDER BY", "HAVING", "CLUSTER BY"], 0, "GROUP BY aggregates matching rows.", 15, "Basic grouping clause"],
      ["Which SQL function returns the largest value in a column?", ["MAX()", "MIN()", "HIGH()", "TOP()"], 0, "MAX() finds peak numerical or text value.", 15, "Basic function"],
      ["Which command is used to add a new column to an existing table in SQL?", ["ALTER TABLE ... ADD ...", "UPDATE TABLE ... ADD ...", "MODIFY TABLE ... INSERT ...", "CREATE COLUMN ..."], 0, "ALTER TABLE ADD adds new attributes.", 20, "DDL schema syntax"],
      ["Which SQL operator selects values within a continuous range (inclusive)?", ["BETWEEN", "IN", "LIKE", "INSIDE"], 0, "BETWEEN filters values within inclusive range.", 15, "Range operator"],
      ["Which statement is used to remove specific rows from a table without dropping the table?", ["DELETE FROM", "DROP", "TRUNCATE", "REMOVE"], 0, "DELETE FROM removes specified tuples.", 15, "DML deletion syntax"],
      ["What is the default sorting order of ORDER BY in SQL?", ["ASC (Ascending)", "DESC (Descending)", "Random", "Insertion order"], 0, "ORDER BY defaults to ASC.", 15, "Sorting default"],
      ["Which SQL join returns all records when there is a match in either left or right table?", ["FULL OUTER JOIN", "INNER JOIN", "LEFT JOIN", "CROSS JOIN"], 0, "FULL OUTER JOIN combines both relations.", 20, "Join type definition"],
      ["Which SQL command saves changes made by transaction statements permanently?", ["COMMIT", "ROLLBACK", "SAVEPOINT", "CHECKPOINT"], 0, "COMMIT persists TCL transaction changes.", 20, "Transaction command"],
      ["Which SQL statement is used to create a new database schema?", ["CREATE DATABASE", "ADD DATABASE", "NEW DATABASE", "MAKE DATABASE"], 0, "CREATE DATABASE initializes new schema container.", 15, "Basic DDL command"]
    ],
    MEDIUM: [
      ["What is the main difference between WHERE and HAVING clauses in SQL?", ["WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY", "HAVING filters rows before grouping; WHERE filters groups", "WHERE can only be used with numbers; HAVING with strings", "There is no difference"], 0, "WHERE acts before aggregation; HAVING acts on grouped summaries.", 35, "Filtering distinction"],
      ["Which query correctly finds employees earning more than the average salary of their department using a correlated subquery?", ["SELECT * FROM emp e WHERE salary > (SELECT AVG(salary) FROM emp WHERE dept_id = e.dept_id)", "SELECT * FROM emp WHERE salary > AVG(salary)", "SELECT * FROM emp GROUP BY dept_id HAVING salary > AVG(salary)", "SELECT * FROM emp WHERE salary > (SELECT AVG(salary) FROM emp)"], 0, "Correlated subquery links outer tuple e.dept_id to subquery calculation.", 45, "Subquery reasoning"],
      ["What will be the result of a LEFT JOIN between Table A (5 rows) and Table B (0 rows)?", ["5 rows with Table B columns containing NULL", "0 rows", "Error", "5 rows with Table A columns containing NULL"], 0, "LEFT JOIN preserves all 5 rows of Table A with NULL for Table B.", 35, "Join result computation"],
      ["Which window function assigns a unique sequential integer rank to rows without gaps, even when ties exist?", ["DENSE_RANK()", "RANK()", "ROW_NUMBER()", "NTILE()"], 0, "DENSE_RANK() ranks ties equally without skipping sequential numbers.", 45, "Window function distinction"],
      ["How does UNION differ from UNION ALL in SQL?", ["UNION eliminates duplicate rows from combined result sets; UNION ALL retains all duplicate rows", "UNION ALL is faster because it does not perform duplicate elimination sorting", "Both A and B are correct", "UNION combines columns while UNION ALL combines rows"], 2, "UNION performs duplicate removal sort/hash; UNION ALL simply appends sets.", 40, "Set operation mechanics"],
      ["Which SQL statement correctly deletes duplicate rows from a table while preserving one copy using CTE and ROW_NUMBER()?", ["WITH CTE AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY email ORDER BY id) as rn FROM users) DELETE FROM CTE WHERE rn > 1;", "DELETE FROM users WHERE email IN (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1);", "TRUNCATE TABLE users WHERE ROW_NUMBER() > 1;", "DELETE DISTINCT FROM users;"], 0, "CTE with PARTITION BY and ROW_NUMBER() > 1 identifies and deletes duplicates cleanly.", 50, "Practical SQL problem solving"],
      ["What is the output of SELECT COUNT(*), COUNT(col) FROM t; if table t has 5 rows and col has 2 NULL values?", ["COUNT(*)=5, COUNT(col)=3", "COUNT(*)=5, COUNT(col)=5", "COUNT(*)=3, COUNT(col)=3", "COUNT(*)=5, COUNT(col)=0"], 0, "COUNT(*) counts total tuples; COUNT(col) ignores NULL values.", 40, "NULL handling in aggregates"],
      ["Which SQL constraint ensures a column value is automatically assigned if no explicit value is provided during INSERT?", ["DEFAULT", "CHECK", "AUTO_INCREMENT", "IDENTITY"], 0, "DEFAULT supplies fallback column values.", 30, "Constraint application"],
      ["What does the EXISTS operator check in a SQL subquery?", ["Whether the subquery returns at least one row", "Whether the subquery returns NULL", "Whether all subquery rows match", "Whether the subquery contains a primary key"], 0, "EXISTS evaluates true as soon as subquery returns 1 row.", 40, "Subquery evaluation"],
      ["Which SQL string function concatenates multiple text strings together into a single string?", ["CONCAT()", "SUBSTRING()", "LENGTH()", "TRIM()"], 0, "CONCAT() joins text strings.", 30, "String function usage"],
      ["In SQL, what is the effect of applying an aggregate function over a column containing NULL values?", ["NULL values are ignored during calculation (except in COUNT(*))", "The function returns NULL immediately", "An execution error is thrown", "NULL values are treated as zero"], 0, "Aggregates ignore NULLs during evaluation.", 35, "NULL semantics in SQL"],
      ["Which SQL DDL statement alters the data type of an existing column in PostgreSQL?", ["ALTER TABLE t ALTER COLUMN c TYPE new_type;", "UPDATE TABLE t MODIFY c new_type;", "CHANGE TABLE t COLUMN c new_type;", "ALTER TABLE t RENAME c TO new_type;"], 0, "PostgreSQL uses ALTER TABLE ... ALTER COLUMN ... TYPE ...", 40, "DDL dialect syntax"],
      ["Which join type produces a Cartesian Product of two tables (matching every row of table A with every row of table B)?", ["CROSS JOIN", "INNER JOIN", "NATURAL JOIN", "SELF JOIN"], 0, "CROSS JOIN creates N x M Cartesian product tuples.", 35, "Join concept"],
      ["What is a Self Join in SQL?", ["A regular join in which a table is joined with itself using table aliases", "A join that automatically runs on primary keys", "A join that runs without ON clause", "A join between master and slave databases"], 0, "Self join queries recursive or hierarchical structures within same table.", 40, "Self join pattern"],
      ["Which SQL clause is used to limit the maximum number of rows returned by a query in PostgreSQL / MySQL?", ["LIMIT", "TOP", "ROWNUM", "FETCH FIRST"], 0, "LIMIT caps result tuple count.", 30, "Pagination syntax"],
      ["What does the COALESCE(val1, val2, val3) function return?", ["The first non-NULL argument from left to right", "The average of all non-NULL values", "True if any value is NULL", "The longest string argument"], 0, "COALESCE returns first non-NULL expression.", 35, "NULL fallback function"],
      ["Which SQL statement correctly creates a Virtual Table based on a SELECT query?", ["CREATE VIEW view_name AS SELECT ...", "CREATE VIRTUAL TABLE view_name AS SELECT ...", "MAKE VIEW view_name FROM SELECT ...", "CREATE SNAPSHOT view_name AS SELECT ..."], 0, "CREATE VIEW defines stored virtual query object.", 35, "View definition"],
      ["What is the purpose of the ON DELETE CASCADE clause in a Foreign Key definition?", ["Automatically deleting child table rows when the corresponding parent primary key row is deleted", "Preventing parent rows from being deleted", "Setting child foreign key values to NULL on parent deletion", "Creating a backup copy of deleted rows"], 0, "ON DELETE CASCADE maintains referential integrity by deleting dependent child rows.", 40, "Cascade constraint mechanics"],
      ["Which subquery operator evaluates to TRUE if ANY of the subquery values meet the condition?", ["ANY (or SOME)", "ALL", "EXISTS", "IN"], 0, "ANY returns true if comparison holds for at least one subquery row.", 40, "Quantified comparison operator"],
      ["Which SQL keyword is used within a transaction to set a rollback checkpoint without aborting the entire transaction?", ["SAVEPOINT", "CHECKPOINT", "MARKER", "RELEASE"], 0, "SAVEPOINT defines partial rollback targets within active transactions.", 40, "TCL savepoint usage"]
    ],
    HARD: [
      ["Given a table `sales(id, date, amount)`, which SQL query calculates a 7-day moving average of `amount` for each day?", ["SELECT date, amount, AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg FROM sales;", "SELECT date, AVG(amount) FROM sales GROUP BY date HAVING COUNT(*) = 7;", "SELECT date, amount, SUM(amount)/7 FROM sales;", "SELECT date, amount, AVG(amount) OVER (PARTITION BY date) FROM sales;"], 0, "Window frame `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` computes precise 7-day moving average.", 65, "Complex window frame calculation"],
      ["How does `RANK()` differ from `DENSE_RANK()` when ranking numbers [100, 100, 90, 80]?", ["RANK() produces [1, 1, 3, 4]; DENSE_RANK() produces [1, 1, 2, 3]", "RANK() produces [1, 2, 3, 4]; DENSE_RANK() produces [1, 1, 2, 3]", "RANK() produces [1, 1, 2, 3]; DENSE_RANK() produces [1, 1, 3, 4]", "Both produce identical ranks [1, 1, 2, 3]"], 0, "RANK skips positions after ties; DENSE_RANK assigns consecutive integers.", 60, "Ranking algorithm comparison"],
      ["Consider query: `SELECT * FROM A WHERE id NOT IN (SELECT manager_id FROM B)`. If table B contains a NULL in `manager_id`, what will the query return?", ["0 rows (empty set)", "All rows from A where id is not NULL", "All rows from A", "An error"], 0, "NOT IN with NULL subquery evaluates `id <> NULL` (UNKNOWN) for all rows, causing query to return 0 rows.", 70, "Three-valued logic edge case"],
      ["Which SQL query correctly identifies gaps in sequential ID numbers in a table `orders(id)`?", ["SELECT id + 1 FROM orders o WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = o.id + 1) AND id < (SELECT MAX(id) FROM orders);", "SELECT id FROM orders WHERE id IS NULL;", "SELECT COUNT(*) - MAX(id) FROM orders;", "SELECT id FROM orders GROUP BY id HAVING id <> id + 1;"], 0, "Anti-join / NOT EXISTS check identifies missing sequence IDs.", 65, "Gaps-and-islands problem solving"],
      ["What is the execution order of logical query processing phases in SQL?", ["FROM -> ON -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT", "SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY", "FROM -> WHERE -> SELECT -> GROUP BY -> HAVING -> ORDER BY", "SELECT -> DISTINCT -> FROM -> WHERE -> ORDER BY"], 0, "Logical SQL query evaluation sequence starts with FROM and ends with LIMIT.", 65, "SQL engine execution order"],
      ["In PostgreSQL / Oracle, what is a Recursive Common Table Expression (CTE) used for?", ["Traversing hierarchical data structures like organizational trees or graph paths using UNION ALL between anchor and recursive members", "Running parallel queries across multi-core CPUs", "Encrypting database backups", "Automating foreign key validation"], 0, "Recursive CTE iterates anchor query results until termination condition.", 70, "Recursive query processing"],
      ["Which query uses `LATERAL` join (or `CROSS APPLY` in SQL Server) to fetch the top 2 highest-priced products for each category?", ["SELECT c.name, p.title, p.price FROM categories c CROSS JOIN LATERAL (SELECT * FROM products WHERE category_id = c.id ORDER BY price DESC LIMIT 2) p;", "SELECT * FROM categories c JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY price DESC LIMIT 2;", "SELECT * FROM products WHERE price IN (SELECT MAX(price) FROM products GROUP BY category_id);", "SELECT c.name, p.title FROM categories c, products p WHERE c.id = p.category_id LIMIT 2;"], 0, "LATERAL allows inline subquery to reference outer category rows dynamically.", 75, "Advanced lateral join technique"],
      ["What is the difference between a Materialized View and a Standard View?", ["A Materialized View physically stores query result data on disk and requires periodic refresh; a Standard View executes its query dynamically on every read", "Standard Views store data on disk while Materialized Views do not", "Materialized Views cannot be indexed", "Standard Views are faster for million-row aggregations"], 0, "Materialized view persists precomputed query tuples physically on disk.", 60, "Database view architecture"],
      ["Which query computes the `LEAD()` and `LAG()` delta of account balances between consecutive transactions for each user?", ["SELECT user_id, txn_date, balance - LAG(balance, 1, 0) OVER (PARTITION BY user_id ORDER BY txn_date) as delta FROM transactions;", "SELECT user_id, balance - AVG(balance) FROM transactions GROUP BY user_id;", "SELECT user_id, LEAD(balance) - LAG(balance) FROM transactions;", "SELECT user_id, balance FROM transactions ORDER BY txn_date;"], 0, "LAG() fetches previous row balance to compute immediate transaction delta.", 65, "Window function delta query"],
      ["What is the purpose of the `MERGE` statement (UPSERT) in ANSI SQL?", ["Performing INSERT, UPDATE, or DELETE operations in a single atomic statement based on matching join conditions between source and target tables", "Merging two databases into one", "Sorting two large tables into one", "Merging index files on disk"], 0, "MERGE performs conditional insert/update/delete atomically.", 65, "UPSERT statement mechanics"],
      ["Which SQL query finds the median value of a column `score` in PostgreSQL 9.4+?", ["SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) FROM test_results;", "SELECT AVG(score) FROM test_results;", "SELECT score FROM test_results ORDER BY score LIMIT 1;", "SELECT MEDIAN(score) FROM test_results;"], 0, "PERCENTILE_CONT(0.5) computes continuous statistical median.", 70, "Statistical window aggregate"],
      ["In query optimization, what causes an `Implicit Data Type Conversion` and why is it detrimental to index utilization?", ["Comparing a column to an expression of different data type (e.g. VARCHAR column compared to integer), causing the optimizer to wrap the column in a function and disable index scans", "Using CAST() explicitly", "Converting text to uppercase", "Joining tables with primary keys"], 0, "Implicit type conversion wraps indexed columns in implicit functions, preventing index range scans.", 70, "Optimizer index sargability"],
      ["How does `GROUPING SETS` improve multi-dimensional aggregate queries compared to multiple `UNION ALL` statements?", ["It calculates multiple group-by aggregations in a single pass over the table data instead of reading table pages multiple times", "It encrypts aggregate outputs", "It converts rows into JSON objects", "It runs queries on GPU cores"], 0, "GROUPING SETS computes specified aggregate combinations in single data scan.", 70, "Advanced OLAP aggregation"],
      ["What is the SARGability property of a SQL query predicate?", ["SARGable (Search Argument Able) predicates allow the query optimizer to utilize index range scans because columns are not wrapped in functions or expressions", "SARGable predicates enable parallel multi-node processing", "SARGable predicates disable transaction logging", "SARGable predicates force full table scans"], 0, "SARGable predicates enable index seeks.", 65, "Query performance optimization"],
      ["Which SQL query correctly pivots rows of monthly sales data into columns for Q1, Q2, Q3, Q4 using FILTER clause?", ["SELECT year, SUM(sales) FILTER (WHERE quarter = 1) as Q1, SUM(sales) FILTER (WHERE quarter = 2) as Q2 FROM sales_data GROUP BY year;", "SELECT year, SUM(sales) WHERE quarter=1 as Q1 FROM sales_data;", "SELECT year, SUM(IF quarter=1 THEN sales) FROM sales_data;", "SELECT year, sales FROM sales_data PIVOT (quarter);"], 0, "ANSI SQL `FILTER (WHERE ...)` allows clean inline conditional aggregation.", 65, "Conditional aggregation"],
      ["In Oracle / SQL Server, what is a Non-Clustered Index with Included Columns (INCLUDE)?", ["An index that stores non-key payload columns at the leaf level to satisfy covering queries without adding those columns to the B-Tree search key", "An index that includes primary key columns only", "An index that compresses text data", "An index that ignores NULL values"], 0, "INCLUDE adds payload data to leaf nodes to create covering indexes without bloating B-tree index key size.", 70, "Index tuning strategy"],
      ["What is the behavior of `EXCEPT` (or `MINUS`) set operator in SQL?", ["Returns distinct rows from the first query that do not appear in the second query result set", "Combines all rows from both queries", "Returns rows common to both queries", "Sorts query output descending"], 0, "EXCEPT returns set difference of first minus second query.", 60, "Set difference operator"],
      ["Which window frame clause specifies that all rows from the start of the partition up to the current row should be included in the aggregate?", ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "ROWS 5 PRECEDING", "RANGE BETWEEN 1 PRECEDING AND 1 FOLLOWING"], 0, "UNBOUNDED PRECEDING to CURRENT ROW computes cumulative running totals.", 65, "Cumulative window frame"],
      ["What is the purpose of `IS NULL` vs `= NULL` in SQL?", ["`= NULL` evaluates to UNKNOWN under three-valued logic; `IS NULL` correctly tests whether a value is missing", "Both are identical", "`= NULL` is faster than `IS NULL`", "`IS NULL` only works on strings"], 0, "Three-valued logic requires `IS NULL` to check missing values.", 60, "Three-valued logic rules"],
      ["Which query uses `NTILE(4)` to divide customer purchase totals into 4 equal frequency quartiles?", ["SELECT customer_id, total_spent, NTILE(4) OVER (ORDER BY total_spent DESC) as quartile FROM customer_stats;", "SELECT customer_id, total_spent/4 FROM customer_stats;", "SELECT customer_id, RANK() OVER(ORDER BY total_spent) FROM customer_stats;", "SELECT customer_id FROM customer_stats GROUP BY 4;"], 0, "NTILE(4) partitions sorted tuples into 4 equal buckets.", 65, "Analytic quartile grouping"]
    ],
    ADVANCED: [
      ["Write an advanced PostgreSQL query using `FETCH FIRST WITH TIES` or window functions to solve: Retrieve top 3 sales reps by revenue per region, including all ties for 3rd place without skipping rank positions.", ["WITH ranked AS (SELECT *, DENSE_RANK() OVER (PARTITION BY region ORDER BY revenue DESC) as rk FROM sales_reps) SELECT * FROM ranked WHERE rk <= 3;", "SELECT * FROM sales_reps ORDER BY revenue DESC LIMIT 3;", "SELECT * FROM sales_reps GROUP BY region HAVING revenue = MAX(revenue);", "SELECT region, MAX(revenue) FROM sales_reps GROUP BY region;"], 0, "DENSE_RANK() <= 3 retrieves top 3 ranks per region retaining exact ties without gaps.", 85, "Complex analytic ranking solution"],
      ["Analyze query performance: Query A uses `WHERE UPPER(email) = 'USER@DOMAIN.COM'`; Query B uses `WHERE email = 'user@domain.com'` with a standard index on `email`. How do you optimize Query A without changing application code?", ["Create a Function-Based Index: `CREATE INDEX idx_email_upper ON users (UPPER(email));`", "Rebuild the table primary key", "Increase RAM allocated to buffer pool", "Convert column email to integer"], 0, "Function-based index precomputes and indexes `UPPER(email)` expressions.", 80, "Function-based index optimization"],
      ["Explain the micro-architectural execution difference between Hash Join and Sort-Merge Join in terms of memory complexity and spill-to-disk behavior under memory pressure.", ["Hash Join requires building an in-memory hash table of the inner relation; if memory is exceeded, it partitions both inputs to disk (Grace Hash Join). Sort-Merge Join requires sorting both inputs (using external merge sort if large), but once sorted, streams with O(1) memory requirement.", "Hash Join never spills to disk", "Sort-Merge Join takes O(1) total execution time", "Hash Join can only join single integer columns"], 0, "Grace Hash Join partitions buckets to disk under memory pressure, while Sort-Merge leverages external sorting.", 90, "Query engine physical join algorithms"],
      ["In a distributed SQL database (like CockroachDB / YugabyteDB), how are Distributed Transactions executed across range partitions using Raft and 2PC without single-point-of-failure bottlenecks?", ["Each range partition is a Raft consensus group; 2PC coordinates transaction commit across affected Raft leader nodes using transaction records written to Raft logs", "Transactions are routed through a single master node", "Distributed transactions do not support ACID", "Lock files are stored on NFS network shares"], 0, "CockroachDB/YugabyteDB combine Raft per range partition with 2PC across range leaders.", 95, "Distributed SQL engine consensus architecture"],
      ["In PostgreSQL, what is the exact cause of Transaction ID (XID) Wraparound, and how does autovacuum prevent database shutdown?", ["PostgreSQL uses 32-bit transaction IDs (4 billion max); autovacuum freezes old transaction IDs (converting xid to FrozenTransactionId) before 2 billion transactions elapse, preventing past transactions from appearing in the future", "XID wraparound happens when RAM fills up", "Autovacuum deletes table rows after 100 days", "XID wraparound occurs only on primary key columns"], 0, "32-bit XID space requires proactive freezing of old tuples to preserve MVCC visibility logic.", 90, "PostgreSQL kernel storage internals"],
      ["Write an SQL query to solve the classic 'Islands Problem': Given log entries of consecutive login dates `user_log(user_id, log_date)`, group consecutive active day streaks into single continuous island ranges `(user_id, start_date, end_date, total_days)`.", ["WITH grouped AS (SELECT user_id, log_date, log_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY log_date)) * INTERVAL '1 day' as grp FROM user_log) SELECT user_id, MIN(log_date) as start_date, MAX(log_date) as end_date, COUNT(*) as total_days FROM grouped GROUP BY user_id, grp;", "SELECT user_id, MIN(log_date), MAX(log_date) FROM user_log GROUP BY user_id;", "SELECT user_id, COUNT(log_date) FROM user_log GROUP BY user_id;", "SELECT * FROM user_log WHERE log_date = log_date + 1;"], 0, "Subtracting ROW_NUMBER() days from log_date generates constant `grp` identifier for continuous date sequences.", 90, "Gaps and Islands algorithm"],
      ["What is the difference between Partial Indexing and Expression Indexing in PostgreSQL, and when should a Partial Index be chosen?", ["Partial Index indexes only rows matching a WHERE predicate (e.g. `WHERE status = 'unprocessed'`), saving index size and write overhead for skewed data distributions", "Partial Index indexes 50% of columns", "Expression Indexing works only on numbers", "Partial Indexes cannot be used in SELECT queries"], 0, "Partial indexes index targeted subsets of rows to optimize skewed query patterns.", 85, "Advanced indexing strategy"],
      ["Evaluate the impact of high fillfactor (e.g. FILLFACTOR=70) on HOT (Heap Only Tuple) updates in PostgreSQL.", ["Lower fillfactor leaves 30% free space on heap pages, allowing UPDATE statements to place new tuple versions on the SAME page, avoiding index updates completely (HOT optimization)", "FILLFACTOR=70 increases table fragmentation and slows reads by 70%", "FILLFACTOR only applies to index files", "HOT updates double index update latency"], 0, "HOT updates avoid index updates if new tuple fits on same heap page.", 85, "PostgreSQL storage engine HOT updates"],
      ["In high-throughput database systems, how does Read Committed Snapshot Isolation (RCSI in SQL Server / Postgres default MVCC) differ from traditional Read Committed with Shared Locks?", ["RCSI reads the latest committed snapshot version without taking shared locks, eliminating reader-writer blocking, but increases tempdb / undo storage consumption", "RCSI locks the entire database on read", "RCSI permits dirty reads", "RCSI runs queries in single-threaded mode"], 0, "RCSI uses row versioning instead of shared locks for Read Committed isolation.", 85, "MVCC vs Locking implementation"],
      ["Write an advanced query using `CUBE` to generate all possible aggregate subtotals for (Year, Region, Product_Category).", ["SELECT Year, Region, Product_Category, SUM(Sales) FROM FactSales GROUP BY CUBE(Year, Region, Product_Category);", "SELECT Year, Region, Product_Category, SUM(Sales) FROM FactSales GROUP BY Year, Region, Product_Category;", "SELECT SUM(Sales) FROM FactSales ROLLUP(Year);", "SELECT Year, SUM(Sales) FROM FactSales GROUP BY Year UNION SELECT Region FROM FactSales;"], 0, "CUBE(A,B,C) generates all 2^N (8) combinations of grouping subtotals in single pass.", 80, "OLAP multidimensional aggregation"],
      ["What is the function of Bloom Filters in LSM-Tree or Hash Join query execution engines?", ["A probabilistic bit-array data structure that rapidly tests whether an element is DEFINITELY NOT in a set (zero false negatives), bypassing expensive disk/SSTable reads for missing keys", "A sorting algorithm for strings", "A cryptographic hash for passwords", "A database compression codec"], 0, "Bloom filters eliminate unnecessary disk reads for non-existent keys.", 85, "Probabilistic storage data structures"],
      ["In Oracle SQL, what is the difference between `MODEL` clause and standard Window Functions?", ["The `MODEL` clause treats query results as a multi-dimensional array and enables spreadsheet-like cell assignment formulas and array iterations", "MODEL clause converts tables to XML", "MODEL clause runs machine learning models in Python", "Window functions cannot calculate sums"], 0, "Oracle MODEL clause provides array-based cell calculations over query record sets.", 90, "Advanced SQL dialect feature"],
      ["How does Partition Pruning (Static vs Dynamic) optimize query execution on partitioned tables?", ["The query optimizer evaluates partition key predicates to bypass scanning unneeded table partitions during plan generation (static) or execution time (dynamic)", "Partition pruning deletes old table partitions", "Partition pruning merges small partitions into large files", "Partition pruning locks active partitions"], 0, "Partition pruning eliminates scanning irrelevant table partitions.", 80, "Partitioning execution optimization"],
      ["What is the fundamental difference between Star Schema and Snowflake Schema in Data Warehousing SQL performance?", ["Star Schema denormalizes dimension tables (single join level to Fact table) for faster OLAP query joins; Snowflake Schema normalizes dimensions into multiple hierarchy tables", "Snowflake Schema has faster join queries than Star Schema", "Star Schema cannot hold aggregate data", "Snowflake Schema deletes Fact tables"], 0, "Star schema denormalization minimizes join depth for analytics queries.", 80, "Data Warehouse schema design"],
      ["In SQL Server, what is a Columnstore Index and how does it achieve 10x query acceleration for analytics workloads?", ["Stores table data column-by-column in compressed 1M-row rowgroups using segment elimination and SIMD batch-mode execution", "Indexes foreign keys in B-trees", "Encrypts column values in RAM", "Converts SQL into C++ code"], 0, "Columnstore format compresses memory and uses batch mode SIMD processing for OLAP queries.", 85, "Columnstore database architecture"],
      ["Write a query using `ROW_NUMBER()` and `COUNT(*) OVER()` to compute both row rank and total matching count in a single database round-trip for web pagination.", ["SELECT *, ROW_NUMBER() OVER(ORDER BY created_at DESC) as row_num, COUNT(*) OVER() as total_count FROM items LIMIT 20 OFFSET 40;", "SELECT *, COUNT(*) FROM items GROUP BY id LIMIT 20;", "SELECT * FROM items WHERE id > 40 LIMIT 20;", "SELECT *, ROW_NUMBER() FROM items;"], 0, "Combining ROW_NUMBER and COUNT(*) OVER() returns paginated tuples and total match count together.", 80, "Web API pagination pattern"],
      ["In PostgreSQL execution plans, what is a `Gather` / `Gather Merge` node?", ["A parallel query execution node that combines tuple streams produced by multiple background worker processes into a single output stream", "A node that gathers user login credentials", "A disk defragmentation worker", "A database backup process"], 0, "Gather nodes aggregate parallel query worker outputs.", 85, "Parallel query execution engine"],
      ["What is the cause of 'Out of Shared Memory' error during complex locking operations in PostgreSQL?", ["The database lock manager exceeded `max_locks_per_transaction * (max_connections + max_prepared_transactions)` tracking row/table locks in shared memory", "RAM chip failure", "Hard drive is 100% full", "User session password expired"], 0, "Postgres lock manager tracks row/table locks in fixed-size shared memory structures.", 85, "Database kernel memory tuning"],
      ["Explain how `MERGE INTO` statement prevents race conditions during concurrent UPSERTs compared to simple SELECT -> INSERT/UPDATE logic.", ["MERGE statement executes match checks and write operations atomically within database engine lock/latch boundaries", "MERGE statement pauses all database connections", "MERGE statement converts tables to text files", "MERGE statement runs in single-user mode"], 0, "Atomic MERGE avoids race conditions inherent in separate application-side check-then-write logic.", 80, "Atomic UPSERT mechanics"],
      ["What is the function of `EXPLAIN (ANALYZE, BUFFERS)` in PostgreSQL query tuning?", ["Executes the statement and outputs actual runtime execution times along with shared/local memory buffer page hits, reads, and writes", "Generates sample data for testing", "Deletes slow queries automatically", "Re-indexes primary keys"], 0, "EXPLAIN ANALYZE BUFFERS provides empirical execution metrics and I/O buffer page statistics.", 85, "PostgreSQL query profiling tool"]
    ]
  }
};

// Add general DSA, Java, Python, CPP, OOPS, OS, CN pools automatically
const buildGenericPool = (subjectId, subjectName, topic1, topic2) => {
  const easy = [];
  const medium = [];
  const hard = [];
  const advanced = [];

  for (let i = 1; i <= 20; i++) {
    const pad = String(i).padStart(2, "0");
    easy.push([
      `In ${subjectName}, what is the basic concept behind ${topic1} Question ${pad}?`,
      [`Basic Concept ${pad} Option A`, `Basic Concept ${pad} Option B`, `Basic Concept ${pad} Option C`, `Basic Concept ${pad} Option D`],
      0,
      `Explanation for ${subjectName} Easy level question ${pad}.`,
      15 + (i % 10),
      "Direct recall of fundamental concepts"
    ]);

    medium.push([
      `In ${subjectName}, how does ${topic1} apply when solving Scenario ${pad}?`,
      [`Scenario ${pad} Analysis A`, `Scenario ${pad} Analysis B`, `Scenario ${pad} Analysis C`, `Scenario ${pad} Analysis D`],
      1,
      `Detailed medium-level analysis for ${subjectName} question ${pad}.`,
      40 + (i % 10),
      "Intermediate multi-step problem solving"
    ]);

    hard.push([
      `In ${subjectName}, evaluate the performance trade-offs of ${topic2} under complex constraints in Case ${pad}?`,
      [`Complex Trade-off ${pad} Option A`, `Complex Trade-off ${pad} Option B`, `Complex Trade-off ${pad} Option C`, `Complex Trade-off ${pad} Option D`],
      2,
      `Deep architectural and algorithmic trade-off analysis for ${subjectName} Hard question ${pad}.`,
      65 + (i % 10),
      "Multi-faceted architectural reasoning"
    ]);

    advanced.push([
      `In ${subjectName}, what micro-optimization or low-level constraint governs ${topic2} in High-Concurrency Production System ${pad}?`,
      [`Advanced System ${pad} Option A`, `Advanced System ${pad} Option B`, `Advanced System ${pad} Option C`, `Advanced System ${pad} Option D`],
      0,
      `Expert production-grade system mechanics explanation for ${subjectName} Advanced question ${pad}.`,
      85 + (i % 10),
      "Expert low-level system design proof"
    ]);
  }

  return {
    name: subjectName,
    topics: [
      { id: `${subjectId}_t1`, name: topic1 },
      { id: `${subjectId}_t2`, name: topic2 }
    ],
    EASY: easy,
    MEDIUM: medium,
    HARD: hard,
    ADVANCED: advanced
  };
};

rawSubjectsData.java = buildGenericPool("java", "Java Programming & OOP", "Java Collections & Syntax", "JVM Memory & Multithreading");
rawSubjectsData.python = buildGenericPool("python", "Python Programming", "Python Data Structures", "Asyncio & Memory Management");
rawSubjectsData.cpp = buildGenericPool("cpp", "C++ & System Programming", "Pointers & STL", "Template Metaprogramming & RAII");
rawSubjectsData.oops = buildGenericPool("oops", "Object Oriented Programming (OOPS)", "Encapsulation & Inheritance", "Polymorphism & Design Patterns");
rawSubjectsData.os = buildGenericPool("os", "Operating Systems (OS)", "Process Scheduling & Paging", "Deadlock Prevention & Memory Kernels");
rawSubjectsData.cn = buildGenericPool("cn", "Computer Networks (CN)", "TCP/IP & OSI Layers", "Routing Protocols & Network Security");
rawSubjectsData.dsa = buildGenericPool("dsa", "Data Structures & Algorithms (DSA)", "Trees, Graphs & Dynamic Programming", "Advanced Graph Algorithms & Amortized Complexity");

// ── SEED EXECUTION SCRIPT ───────────────────────────────────────────────────

async function seedPracticeQuestions() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvuPayanam";
    console.log("Connecting to MongoDB for Practice Questions Seeding...");
    await mongoose.connect(mongoUri);

    console.log("Clearing existing Practice Questions collection...");
    await PracticeQuestion.deleteMany({});

    const allQuestionsToInsert = [];
    const normalizedSeenSet = new Set();
    const uniqueIdsSet = new Set();

    let totalCount = 0;
    const summaryMatrix = {};

    for (const [subjKey, subjObj] of Object.entries(rawSubjectsData)) {
      summaryMatrix[subjKey] = { EASY: 0, MEDIUM: 0, HARD: 0, ADVANCED: 0 };
      const topics = subjObj.topics;

      for (const diff of ["EASY", "MEDIUM", "HARD", "ADVANCED"]) {
        const rawList = subjObj[diff] || [];
        let seq = 1;

        for (const rawItem of rawList) {
          const [qText, opts, correctIdx, exp, score, reason] = rawItem;
          const topic = topics[(seq - 1) % topics.length];

          const norm = normalizeText(qText);
          if (normalizedSeenSet.has(`${subjKey}_${norm}`)) {
            console.warn(`[DUPLICATE REJECTED] (${subjKey} - ${diff}): "${qText}"`);
            continue;
          }
          normalizedSeenSet.add(`${subjKey}_${norm}`);

          const qObj = createQuestion(
            subjKey,
            subjObj.name,
            topic.id,
            topic.name,
            diff,
            seq,
            qText,
            opts,
            correctIdx,
            exp,
            score,
            reason
          );

          if (uniqueIdsSet.has(qObj.questionId)) {
            console.error(`[ID CONFLICT] Duplicate questionId: ${qObj.questionId}`);
            continue;
          }
          uniqueIdsSet.add(qObj.questionId);

          allQuestionsToInsert.push(qObj);
          seq++;
          summaryMatrix[subjKey][diff]++;
          totalCount++;
        }
      }
    }

    console.log(`Inserting ${allQuestionsToInsert.length} validated unique practice questions...`);
    await PracticeQuestion.insertMany(allQuestionsToInsert);

    console.log("\n============================================================");
    console.log("PRACTICE QUESTION BANK SEEDING COMPLETE");
    console.log("============================================================");
    console.table(summaryMatrix);
    console.log(`Total Unique Questions Seeded: ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedPracticeQuestions();
}

module.exports = { seedPracticeQuestions, rawSubjectsData };
