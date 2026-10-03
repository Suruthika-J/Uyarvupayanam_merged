const fs = require('fs');
const path = require('path');

const eceRawData = [
  // 1. VLSI & Chip Design
  {
    domainId: 'vlsi_chip_design',
    domainName: 'VLSI & Chip Design',
    category: 'Semiconductors & Chip Design',
    skillDimensions: ['system_thinking', 'analytical_thinking', 'attention_to_detail'],
    easy: [
      {
        q: 'What does VLSI stand for?',
        options: ['Very Large Scale Integration', 'Variable Logic System Integration', 'Virtual Large Semiconductor Interface', 'Voltage Level Signal Integration'],
        ans: 'A',
        explanation: 'VLSI stands for Very Large Scale Integration, the process of creating an IC by combining thousands/millions of transistors onto a single chip.'
      },
      {
        q: 'Which HDL is commonly used to describe digital hardware?',
        options: ['HTML', 'Verilog', 'SQL', 'CSS'],
        ans: 'B',
        explanation: 'Verilog (and VHDL) are the industry standard Hardware Description Languages (HDLs) used for digital hardware modeling.'
      },
      {
        q: 'A flip-flop stores how many bits?',
        options: ['1', '2', '4', '8'],
        ans: 'A',
        explanation: 'A flip-flop is a bistable multivibrator that stores exactly one bit of binary data.'
      },
      {
        q: 'Which gate produces 1 only when both inputs are 1?',
        options: ['OR', 'XOR', 'AND', 'NOR'],
        ans: 'C',
        explanation: 'An AND gate outputs logic high (1) only when all its input conditions are logic high (1).'
      },
      {
        q: 'RTL stands for:',
        options: ['Register Transfer Level', 'Real-Time Logic', 'Random Transistor Layout', 'Register Timing Logic'],
        ans: 'A',
        explanation: 'RTL stands for Register Transfer Level, an abstraction for describing digital hardware flow between registers and combinatorial logic.'
      }
    ],
    medium: [
      {
        q: 'The main purpose of synthesis is to convert RTL into:',
        options: ['Machine code', 'A gate-level netlist', 'An image file', 'A database'],
        ans: 'B',
        explanation: 'Logic synthesis translates high-level RTL code into an optimized gate-level netlist mapped to target technology library cells.'
      },
      {
        q: 'Setup time is the minimum time data must be stable:',
        options: ['After the clock edge', 'Before the active clock edge', 'During reset only', 'After power-off'],
        ans: 'B',
        explanation: 'Setup time is the minimum duration the data input must remain stable before the arrival of the active clock transition.'
      },
      {
        q: 'Which fault model assumes a signal is permanently 0 or 1?',
        options: ['Delay fault', 'Stuck-at fault', 'Open-loop fault', 'Thermal fault'],
        ans: 'B',
        explanation: 'The stuck-at fault model (Stuck-At-0 or Stuck-At-1) models circuit defects where a node is permanently tied to low or high rail.'
      },
      {
        q: 'Static timing analysis primarily checks:',
        options: ['Source code style', 'Timing paths and constraints', 'PCB color', 'Memory capacity'],
        ans: 'B',
        explanation: 'Static Timing Analysis (STA) computes the expected timing of a digital circuit without requiring dynamic simulation vectors.'
      },
      {
        q: 'Which language is widely used for verification with SystemVerilog?',
        options: ['UVM', 'HTML', 'XML', 'CSS'],
        ans: 'A',
        explanation: 'UVM (Universal Verification Methodology) is the standard SystemVerilog framework for building modular, scalable testbenches.'
      }
    ],
    hard: [
      {
        q: 'A hold-time violation occurs when data changes:',
        options: ['Too late after the clock edge', 'Too early after the clock edge', 'Only before reset', 'Only during synthesis'],
        ans: 'B',
        explanation: 'Hold time violation occurs when the input data changes too quickly after the clock edge, before the minimum hold duration has elapsed.'
      },
      {
        q: 'Clock skew is the difference in:',
        options: ['Power between chips', 'Arrival time of a clock at different sequential elements', 'Number of transistors', 'Logic levels'],
        ans: 'B',
        explanation: 'Clock skew is the spatial variation in the arrival time of clock edges across different sequential elements on the chip.'
      },
      {
        q: 'In CMOS, dynamic power is approximately proportional to:',
        options: ['C × V² × f', 'V/C × f', 'C/V²', '1/f'],
        ans: 'A',
        explanation: 'Dynamic switching power in CMOS circuits equals alpha * C * Vdd^2 * f, where C is load capacitance, V is supply voltage, and f is clock frequency.'
      },
      {
        q: 'What is the main purpose of clock-tree synthesis?',
        options: ['Generate source code', 'Distribute the clock with controlled skew and latency', 'Reduce software bugs', 'Create test vectors only'],
        ans: 'B',
        explanation: 'Clock Tree Synthesis (CTS) creates an optimized buffer network to deliver clock signals to all sequential elements with minimized skew and insertion delay.'
      },
      {
        q: 'DFT in VLSI primarily improves:',
        options: ['Chip color', 'Testability of the manufactured circuit', 'Internet speed', 'Operating-system security'],
        ans: 'B',
        explanation: 'Design for Testability (DFT) incorporates test features like scan chains, BIST, and boundary scan to facilitate post-manufacturing silicon testing.'
      }
    ]
  },

  // 2. Embedded Systems
  {
    domainId: 'embedded_systems',
    domainName: 'Embedded Systems',
    category: 'Hardware & Firmware',
    skillDimensions: ['problem_solving', 'hardware_interfacing', 'system_thinking'],
    easy: [
      {
        q: 'Which language is most commonly associated with low-level microcontroller programming?',
        options: ['C', 'SQL', 'HTML', 'R'],
        ans: 'A',
        explanation: 'Embedded C is the standard language for microcontroller programming due to its bare-metal access, low memory footprint, and deterministic performance.'
      },
      {
        q: 'A microcontroller typically integrates CPU, memory and:',
        options: ['Peripherals', 'Only a monitor', 'Only a hard disk', 'A web browser'],
        ans: 'A',
        explanation: 'Microcontrollers integrate a CPU, RAM, Flash memory, and I/O peripherals (timers, ADC, UART, GPIO) on a single monolithic silicon die.'
      },
      {
        q: 'GPIO stands for:',
        options: ['General Purpose Input/Output', 'Global Program Input/Output', 'General Processor Internal Operation', 'Graphical Peripheral Interface Output'],
        ans: 'A',
        explanation: 'GPIO pins can be programmatically configured at runtime as digital inputs or digital outputs to interface with external hardware.'
      },
      {
        q: 'Which device converts an analog signal into digital values?',
        options: ['DAC', 'ADC', 'UART', 'GPIO'],
        ans: 'B',
        explanation: 'An Analog-to-Digital Converter (ADC) samples continuous analog voltages and quantizes them into discrete binary numbers.'
      },
      {
        q: 'Which memory is non-volatile and commonly stores firmware?',
        options: ['RAM', 'Flash', 'Cache only', 'Register'],
        ans: 'B',
        explanation: 'Flash memory retains programmed instructions even when unpowered, making it ideal for persistent firmware and bootloader storage.'
      }
    ],
    medium: [
      {
        q: 'An interrupt is used to:',
        options: ['Notify the CPU that an event needs attention', 'Increase RAM size', 'Compile code', 'Power the monitor'],
        ans: 'A',
        explanation: 'Interrupts temporarily suspend regular CPU execution to execute an Interrupt Service Routine (ISR) in response to hardware or software triggers.'
      },
      {
        q: 'UART is primarily used for:',
        options: ['Serial communication', 'Image compression', 'Power conversion', 'Database indexing'],
        ans: 'A',
        explanation: 'UART (Universal Asynchronous Receiver-Transmitter) is an asynchronous serial communication protocol using TX and RX lines.'
      },
      {
        q: 'A watchdog timer is mainly used to:',
        options: ['Recover from software hangs', 'Increase clock frequency', 'Store images', 'Measure humidity'],
        ans: 'A',
        explanation: 'A watchdog timer resets the microcontroller if the main program loop gets stuck in an infinite loop or crashes, restoring system reliability.'
      },
      {
        q: 'PWM is commonly used to control:',
        options: ['LED brightness or motor power', 'Database tables', 'Source-code indentation', 'Ethernet addresses'],
        ans: 'A',
        explanation: 'Pulse-Width Modulation varies the duty cycle of a square wave to regulate the average power delivered to loads like LEDs and DC motors.'
      },
      {
        q: 'SPI commonly uses which signals?',
        options: ['MOSI, MISO, SCLK, CS', 'TX, RX only', 'D+, D- only', 'A0, A1 only'],
        ans: 'A',
        explanation: 'SPI uses Master Out Slave In (MOSI), Master In Slave Out (MISO), Serial Clock (SCLK), and Chip Select (CS/SS).'
      }
    ],
    hard: [
      {
        q: 'A real-time system is mainly characterized by:',
        options: ['Correctness including timing constraints', 'Unlimited memory', 'No interrupts', 'Only high CPU speed'],
        ans: 'A',
        explanation: 'In real-time computing (RTOS), system correctness depends not only on the logical result of computation but also on the deadline at which it is produced.'
      },
      {
        q: 'Priority inversion occurs when:',
        options: ['A high-priority task waits indirectly for a lower-priority task', 'A CPU has two cores', 'RAM becomes non-volatile', 'A sensor outputs analog data'],
        ans: 'A',
        explanation: 'Priority inversion happens when a lower-priority task holds a shared resource needed by a higher-priority task, while a medium task preempts the low one.'
      },
      {
        q: 'DMA allows data transfer:',
        options: ['Between peripherals/memory with reduced CPU involvement', 'Only through the keyboard', 'Only after compilation', 'Without any memory'],
        ans: 'A',
        explanation: 'Direct Memory Access (DMA) enables hardware subsystems to transfer blocks of data between memory and peripherals without continuous CPU polling or load.'
      },
      {
        q: 'Debouncing a mechanical switch is needed because:',
        options: ['Contacts can rapidly oscillate during transition', 'Voltage is always zero', 'Switches generate RF signals', 'RAM loses data'],
        ans: 'A',
        explanation: 'Mechanical switch contacts vibrate and bounce rapidly upon opening or closing, generating spurious multiple digital transitions if not debounced.'
      },
      {
        q: 'An RTOS scheduler primarily decides:',
        options: ['Which ready task gets CPU time', 'Which resistor to use', 'How a PCB is etched', 'Which database query runs'],
        ans: 'A',
        explanation: 'The RTOS kernel scheduler assigns CPU execution time to ready tasks based on priority, time slicing, or deadline scheduling algorithms.'
      }
    ]
  },

  // 3. IoT
  {
    domainId: 'iot',
    domainName: 'IoT',
    category: 'Internet of Things',
    skillDimensions: ['networking_protocols', 'system_thinking', 'cloud_integration'],
    easy: [
      {
        q: 'IoT stands for:',
        options: ['Internet of Things', 'Input of Technology', 'Internet of Terminals', 'Integration of Tools'],
        ans: 'A',
        explanation: 'IoT stands for Internet of Things, the network of physical devices embedded with sensors, software, and connectivity.'
      },
      {
        q: 'A temperature sensor is an example of a:',
        options: ['Sensor', 'Actuator', 'Router', 'Compiler'],
        ans: 'A',
        explanation: 'A temperature sensor measures thermal energy and converts it into a readable electrical parameter.'
      },
      {
        q: 'MQTT is commonly used for:',
        options: ['Lightweight messaging', 'Image editing', 'PCB routing', 'Video rendering'],
        ans: 'A',
        explanation: 'MQTT is an extremely lightweight publish/subscribe protocol designed for constrained devices and low-bandwidth, high-latency networks.'
      },
      {
        q: 'Which protocol is commonly used for local IP networking?',
        options: ['TCP/IP', 'SPI only', 'I2C only', 'UART only'],
        ans: 'A',
        explanation: 'TCP/IP is the foundational suite of communication protocols used to interconnect devices on local networks and the Internet.'
      },
      {
        q: 'An actuator converts a control signal into:',
        options: ['Physical action', 'Source code', 'Database rows', 'Clock cycles only'],
        ans: 'A',
        explanation: 'Actuators take electrical signals and produce mechanical physical movement, such as motors, solenoids, valves, or relays.'
      }
    ],
    medium: [
      {
        q: 'MQTT follows which communication model?',
        options: ['Publish/subscribe', 'Only point-to-point serial', 'Masterless memory', 'Circuit switching'],
        ans: 'A',
        explanation: 'MQTT is built on a publish/subscribe broker model that decouples clients producing telemetry from clients consuming data.'
      },
      {
        q: 'Edge computing processes data:',
        options: ['Closer to the data source', 'Only in a distant data center', 'Only inside a compiler', 'Only on a PCB'],
        ans: 'A',
        explanation: 'Edge computing performs computational processing and filtering at or near the source of data generation to reduce latency and bandwidth usage.'
      },
      {
        q: 'Which technology is designed for low-power wide-area IoT communication?',
        options: ['LoRaWAN', 'HDMI', 'VGA', 'SATA'],
        ans: 'A',
        explanation: 'LoRaWAN is a Low Power Wide Area Network (LPWAN) protocol designed for battery-operated IoT nodes transmitting small data packets over long distances.'
      },
      {
        q: 'A gateway in IoT commonly:',
        options: ['Connects devices/networks and can translate protocols', 'Acts only as a battery', 'Replaces every sensor', 'Compiles firmware'],
        ans: 'A',
        explanation: 'IoT gateways bridge local sensor networks (BLE, ZigBee, LoRa) to wide-area IP networks (Ethernet, Wi-Fi, Cellular) with protocol translation.'
      },
      {
        q: 'TLS mainly provides:',
        options: ['Encryption and authentication for network communication', 'Analog-to-digital conversion', 'Motor control', 'Clock generation'],
        ans: 'A',
        explanation: 'Transport Layer Security (TLS) ensures privacy, integrity, and cryptographic authentication for data transmitted across computer networks.'
      }
    ],
    hard: [
      {
        q: 'A major challenge in large IoT deployments is:',
        options: ['Device identity, security and lifecycle management', 'Having too many keyboards', 'Lack of HTML tags', 'Excessive monitor resolution'],
        ans: 'A',
        explanation: 'Fleet provisioning, unique cryptographic identity, certificate revocation, OTA update management, and vulnerability patching are primary IoT hurdles.'
      },
      {
        q: 'A digital twin is:',
        options: ['A digital representation of a physical asset/system', 'A duplicate battery', 'A type of transistor', 'A serial cable'],
        ans: 'A',
        explanation: 'A digital twin is a dynamic virtual simulation model of a physical asset, process, or system updated with real-time operational sensor telemetry.'
      },
      {
        q: 'QoS in MQTT can control:',
        options: ['Message delivery guarantees', 'Sensor temperature', 'CPU instruction width', 'PCB thickness'],
        ans: 'A',
        explanation: 'MQTT offers QoS levels 0 (at most once), 1 (at least once), and 2 (exactly once) to control delivery guarantees across unreliable links.'
      },
      {
        q: 'OTA firmware updates mean updates are delivered:',
        options: ['Over the network', 'Only through soldering', 'Only through ROM fabrication', 'Only by replacing sensors'],
        ans: 'A',
        explanation: 'Over-The-Air (OTA) updates allow embedded connected devices to receive new firmware releases securely over wireless or IP networks.'
      },
      {
        q: 'For battery-powered IoT nodes, duty cycling mainly helps reduce:',
        options: ['Energy consumption', 'Antenna size', 'Database rows', 'Screen brightness'],
        ans: 'A',
        explanation: 'Duty cycling alternates nodes between brief active transmission states and prolonged deep sleep states to extend battery longevity for years.'
      }
    ]
  },

  // 4. Communication / Telecom
  {
    domainId: 'communication_telecom',
    domainName: 'Communication / Telecom',
    category: 'Telecommunications & Networks',
    skillDimensions: ['analytical_thinking', 'signals_systems', 'system_thinking'],
    easy: [
      {
        q: 'What does LTE refer to?',
        options: ['Long Term Evolution', 'Low Transmission Equipment', 'Logic Transfer Encoding', 'Local Telecom Ethernet'],
        ans: 'A',
        explanation: 'LTE stands for Long Term Evolution, the high-speed 4G mobile telecommunications standard developed by 3GPP.'
      },
      {
        q: 'Which system is designed for mobile wireless communication?',
        options: ['5G', 'USB', 'SATA', 'I2C'],
        ans: 'A',
        explanation: '5G (Fifth Generation) is the global wireless cellular standard offering enhanced mobile broadband, ultra-reliable low latency, and massive machine communication.'
      },
      {
        q: 'Modulation is used to:',
        options: ['Vary a carrier according to information', 'Increase RAM', 'Store files', 'Cool a processor'],
        ans: 'A',
        explanation: 'Modulation modifies the amplitude, frequency, or phase of a high-frequency carrier wave in accordance with the baseband message signal.'
      },
      {
        q: 'Bandwidth refers to:',
        options: ['A frequency range occupied by a signal/channel', 'Battery capacity', 'CPU cores', 'Memory size'],
        ans: 'A',
        explanation: 'Bandwidth is the difference between upper and lower frequencies in a continuous band of signals or transmission channel capacity.'
      },
      {
        q: 'A base station communicates with:',
        options: ['Mobile devices in its coverage area', 'Only printers', 'Only hard drives', 'Only compilers'],
        ans: 'A',
        explanation: 'A cellular base station (e.g. gNodeB / eNodeB) coordinates radio resource management and communicates over the air interface with user equipment (UE).'
      }
    ],
    medium: [
      {
        q: 'In digital communication, BER measures:',
        options: ['Bit errors relative to transmitted bits', 'Battery energy ratio', 'Bandwidth expansion rate', 'Base-station efficiency only'],
        ans: 'A',
        explanation: 'Bit Error Rate (BER) is the ratio of incorrectly received bits to the total number of bits transferred over a digital communication channel.'
      },
      {
        q: 'QAM combines changes in:',
        options: ['Amplitude and phase', 'Only frequency', 'Only resistance', 'Only temperature'],
        ans: 'A',
        explanation: 'Quadrature Amplitude Modulation (QAM) conveys data by modulating both the amplitude of two carrier waves 90 degrees out of phase.'
      },
      {
        q: 'Multipath propagation can cause:',
        options: ['Fading and inter-symbol interference', 'Higher battery capacity', 'Lower processor temperature', 'Database corruption only'],
        ans: 'A',
        explanation: 'Multipath propagation results when radio signals reach the receiving antenna by two or more paths, causing constructive/destructive fading and delay spread.'
      },
      {
        q: 'OFDM divides a channel into:',
        options: ['Multiple orthogonal subcarriers', 'Multiple batteries', 'Multiple CPUs', 'Multiple antennas only'],
        ans: 'A',
        explanation: 'Orthogonal Frequency Division Multiplexing (OFDM) divides high-rate data streams into numerous closely spaced orthogonal narrowband subcarrier frequencies.'
      },
      {
        q: 'A handover in cellular networks occurs when:',
        options: ['A mobile device changes serving cells', 'A phone changes its password', 'A router loses RAM', 'A sensor changes units'],
        ans: 'A',
        explanation: 'Handover (handoff) seamlessly transfers an ongoing call or active data session from one base station/cell tower to another as the user moves.'
      }
    ],
    hard: [
      {
        q: 'MIMO improves wireless links by using:',
        options: ['Multiple antennas', 'Multiple batteries only', 'Multiple operating systems', 'Multiple databases'],
        ans: 'A',
        explanation: 'Multiple-Input Multiple-Output (MIMO) utilizes multiple transmit and receive antennas to increase link spectral efficiency, throughput, and diversity.'
      },
      {
        q: 'Shannon capacity increases with:',
        options: ['Bandwidth and logarithmically with SNR', 'Temperature only', 'Screen size', 'RAM frequency only'],
        ans: 'A',
        explanation: 'Shannon-Hartley theorem states C = B * log2(1 + SNR), showing capacity scales linearly with bandwidth B and logarithmically with signal-to-noise ratio.'
      },
      {
        q: 'A cyclic prefix in OFDM mainly helps mitigate:',
        options: ['Inter-symbol interference due to multipath', 'Battery leakage', 'CPU overheating', 'Antenna corrosion'],
        ans: 'A',
        explanation: 'The cyclic prefix acts as a guard interval between OFDM symbols, converting linear channel convolution into circular convolution to eliminate ISI.'
      },
      {
        q: '5G beamforming primarily uses antenna arrays to:',
        options: ['Steer/concentrate radio energy spatially', 'Encrypt all files', 'Increase RAM', 'Replace modulation'],
        ans: 'A',
        explanation: 'Beamforming manipulates the phase and amplitude of antenna array elements to constructively steer RF energy directly toward target mobile devices.'
      },
      {
        q: 'Link budget calculations account for:',
        options: ['Transmitted power, gains and path losses', 'Only software version', 'Only battery chemistry', 'Only screen resolution'],
        ans: 'A',
        explanation: 'A link budget tallies all transmitted power, amplifier gains, antenna gains, path losses, cable attenuations, and noise margins across the RF link.'
      }
    ]
  },

  // 5. RF & Microwave
  {
    domainId: 'rf_microwave',
    domainName: 'RF & Microwave',
    category: 'Electromagnetics & RF',
    skillDimensions: ['rf_circuits', 'analytical_thinking', 'electromagnetics'],
    easy: [
      {
        q: 'RF stands for:',
        options: ['Radio Frequency', 'Random Function', 'Resistor Feedback', 'Remote File'],
        ans: 'A',
        explanation: 'RF stands for Radio Frequency, referring to electromagnetic wave frequencies ranging from roughly 3 kHz to 300 GHz.'
      },
      {
        q: 'An antenna primarily:',
        options: ['Radiates or receives electromagnetic waves', 'Stores software', 'Converts AC to DC only', 'Measures CPU usage'],
        ans: 'A',
        explanation: 'An antenna is a transducer that interfaces guided electromagnetic waves on transmission lines with free-space radiating waves.'
      },
      {
        q: 'GHz is a unit of:',
        options: ['Frequency', 'Power', 'Voltage', 'Resistance'],
        ans: 'A',
        explanation: 'Gigahertz (GHz) is a standard SI unit of frequency equivalent to one billion cycles per second.'
      },
      {
        q: 'A coaxial cable is commonly used for:',
        options: ['RF signal transmission', 'Database storage', 'Image processing', 'Programming'],
        ans: 'A',
        explanation: 'Coaxial cables feature an inner conductor surrounded by a concentric dielectric and conducting shield to transmit RF signals with minimal radiation loss.'
      },
      {
        q: 'A microwave frequency is generally:',
        options: ['Higher than conventional low-frequency radio bands', 'Always below audio', 'Only DC', 'Zero Hz'],
        ans: 'A',
        explanation: 'Microwave frequencies span from 300 MHz to 300 GHz, higher than traditional MF and HF radio bands.'
      }
    ],
    medium: [
      {
        q: 'S11 is commonly associated with:',
        options: ['Input reflection coefficient/return loss', 'Battery voltage', 'CPU temperature', 'Digital memory'],
        ans: 'A',
        explanation: 'S11 is the scattering parameter representing input port voltage reflection coefficient, measuring how much RF power is reflected back from an antenna or load.'
      },
      {
        q: 'An impedance match helps:',
        options: ['Maximize power transfer and reduce reflections', 'Increase source code size', 'Reduce RAM', 'Change binary to decimal'],
        ans: 'A',
        explanation: 'Impedance matching between source and load eliminates standing waves, maximizes power transfer, and minimizes reflection losses.'
      },
      {
        q: 'VSWR is related to:',
        options: ['Standing waves on a transmission line', 'CPU scheduling', 'Database indexing', 'Image resolution'],
        ans: 'A',
        explanation: 'Voltage Standing Wave Ratio (VSWR) quantifies the ratio of maximum to minimum RF voltage along an unmatched transmission line.'
      },
      {
        q: 'A waveguide is used to:',
        options: ['Guide electromagnetic waves at microwave frequencies', 'Store firmware', 'Generate software interrupts', 'Measure humidity'],
        ans: 'A',
        explanation: 'Waveguides are hollow metallic or dielectric conduits designed to confine and propagate high-frequency microwave and millimeter waves with low loss.'
      },
      {
        q: 'Antenna gain describes:',
        options: ['Directional radiation concentration relative to a reference', 'Battery life only', 'Resistance of copper', 'Processor speed'],
        ans: 'A',
        explanation: 'Antenna gain measures the concentration of radiated electromagnetic power in a specific direction compared to an ideal isotropic or dipole reference radiator.'
      }
    ],
    hard: [
      {
        q: 'Smith charts are commonly used for:',
        options: ['Transmission-line impedance/admittance analysis', 'Image segmentation', 'Database queries', 'CPU scheduling'],
        ans: 'A',
        explanation: 'The Smith Chart is a graphical polar nomogram used in RF engineering to visualize complex impedances, reflection coefficients, and matching network design.'
      },
      {
        q: 'A quarter-wave transformer can be used for:',
        options: ['Impedance matching', 'Analog-to-digital conversion', 'Cooling', 'Encryption'],
        ans: 'A',
        explanation: 'A quarter-wavelength transmission line section transforms real load impedance ZL to input impedance Zin = Z0^2 / ZL, providing narrowband matching.'
      },
      {
        q: 'Skin effect causes RF current to:',
        options: ['Concentrate near the conductor surface', 'Stop completely', 'Flow only through air', 'Become digital'],
        ans: 'A',
        explanation: 'Due to opposing eddy currents at high frequencies, RF current density is highest at the outer conductor surface, exponentially decaying inward.'
      },
      {
        q: 'Friis transmission equation relates received power to:',
        options: ['Transmit power, antenna gains, wavelength and distance', 'CPU clock and RAM', 'Temperature and humidity only', 'Battery chemistry'],
        ans: 'A',
        explanation: 'The Friis formula computes Pr = Pt * Gt * Gr * (lambda / (4 * pi * R))^2 under ideal free-space line-of-sight propagation conditions.'
      },
      {
        q: 'A low-noise amplifier is placed near the receiver input mainly to:',
        options: ['Boost weak signals while adding minimal noise', 'Generate DC power', 'Perform database compression', 'Replace an antenna'],
        ans: 'A',
        explanation: 'An LNA is situated at the receiver front-end to amplify tiny incoming RF signals above the receiver thermal noise floor with minimal noise figure degradation.'
      }
    ]
  },

  // 6. Signal Processing
  {
    domainId: 'signal_processing',
    domainName: 'Signal Processing',
    category: 'Signals & Systems',
    skillDimensions: ['mathematical_modeling', 'analytical_thinking', 'system_thinking'],
    easy: [
      {
        q: 'DSP stands for:',
        options: ['Digital Signal Processing', 'Data System Programming', 'Digital Sensor Power', 'Direct Signal Protocol'],
        ans: 'A',
        explanation: 'DSP stands for Digital Signal Processing, the mathematical manipulation of digital representations of analog signals.'
      },
      {
        q: 'A signal sampled below the Nyquist rate can suffer:',
        options: ['Aliasing', 'Amplification', 'Encryption', 'Modulation only'],
        ans: 'A',
        explanation: 'Undersampling below the Nyquist rate causes high-frequency signal components to fold back into lower frequencies, causing irreversible aliasing distortion.'
      },
      {
        q: 'The Fourier transform is used to analyze:',
        options: ['Frequency components', 'Only battery voltage', 'Only source code', 'Only PCB size'],
        ans: 'A',
        explanation: 'The Fourier Transform decomposes a time-domain signal into its constituent complex sinusoidal frequency components.'
      },
      {
        q: 'An ADC converts:',
        options: ['Analog to digital', 'Digital to analog', 'RF to DC only', 'Text to image'],
        ans: 'A',
        explanation: 'An Analog-to-Digital Converter samples and quantizes real-world continuous signals into digital sequences.'
      },
      {
        q: 'A low-pass filter mainly passes:',
        options: ['Low frequencies', 'Only high frequencies', 'No frequencies', 'Only DC voltage from batteries'],
        ans: 'A',
        explanation: 'A low-pass filter attenuates signals with frequencies higher than its cutoff frequency while permitting low frequencies to pass.'
      }
    ],
    medium: [
      {
        q: 'The Nyquist sampling rate must be at least:',
        options: ['Twice the highest frequency component', 'Equal to the lowest frequency', 'Half the highest frequency', 'Ten times the bit depth'],
        ans: 'A',
        explanation: 'The Nyquist-Shannon sampling theorem mandates that sampling frequency fs must exceed 2 * fmax to completely reconstruct a bandlimited signal.'
      },
      {
        q: 'Convolution is fundamental to:',
        options: ['LTI system analysis and filtering', 'Battery charging only', 'PCB drilling', 'Database normalization'],
        ans: 'A',
        explanation: 'In Linear Time-Invariant (LTI) systems, the output signal is mathematically obtained by convolving the input signal with the impulse response.'
      },
      {
        q: 'An FIR filter has:',
        options: ['Finite impulse response', 'Infinite memory always', 'No coefficients', 'Only analog components'],
        ans: 'A',
        explanation: 'Finite Impulse Response (FIR) filters have impulse responses that settle to zero in finite time, offering inherent stability and linear phase potential.'
      },
      {
        q: 'An IIR filter uses:',
        options: ['Feedback/previous output terms', 'No past samples', 'Only batteries', 'Only FFT hardware'],
        ans: 'A',
        explanation: 'Infinite Impulse Response (IIR) filters employ internal feedback paths, utilizing both current/past inputs and prior output recursive terms.'
      },
      {
        q: 'Windowing before an FFT is often used to reduce:',
        options: ['Spectral leakage', 'Sampling frequency', 'Bit depth', 'Sensor voltage'],
        ans: 'A',
        explanation: 'Window functions (Hamming, Hanning, Blackman) taper non-integer cycle boundaries to zero, suppressing spectral leakage sidelobes in discrete Fourier analysis.'
      }
    ],
    hard: [
      {
        q: 'Increasing FFT size generally improves:',
        options: ['Frequency resolution', 'ADC voltage range automatically', 'Battery capacity', 'Antenna gain'],
        ans: 'A',
        explanation: 'A larger FFT size N increases bin density delta_f = fs / N, yielding finer frequency discrimination between adjacent spectral peaks.'
      },
      {
        q: 'A linear-phase FIR filter can provide:',
        options: ['Constant group delay over its passband', 'Zero computation', 'Infinite bandwidth', 'Automatic encryption'],
        ans: 'A',
        explanation: 'Symmetric or anti-symmetric FIR filters exhibit strictly linear phase response, ensuring all frequency components experience equal time delay without dispersion.'
      },
      {
        q: 'Quantization error results from:',
        options: ['Representing continuous amplitudes with discrete levels', 'Changing time zones', 'Antenna mismatch', 'Clock skew only'],
        ans: 'A',
        explanation: 'Quantization noise is the rounding error introduced when mapping infinite real analog amplitudes to finite discrete binary quantization bins.'
      },
      {
        q: 'An anti-aliasing filter is normally placed:',
        options: ['Before the ADC', 'After the battery', 'Only after the display', 'Inside the database'],
        ans: 'A',
        explanation: 'An analog low-pass anti-aliasing filter precedes the ADC to bandlimit the analog spectrum below fs/2 before sampling occurs.'
      },
      {
        q: 'In an LTI system, the output can be obtained using:',
        options: ['Convolution of input with impulse response', 'Only multiplication by frequency', 'Only differentiation', 'Only thresholding'],
        ans: 'A',
        explanation: 'By the superposition and time-invariance principles, y[n] = x[n] * h[n] completely describes any discrete-time LTI system response.'
      }
    ]
  },

  // 7. Image Processing / Computer Vision
  {
    domainId: 'image_processing_cv',
    domainName: 'Image Processing / Computer Vision',
    category: 'Computer Vision & AI',
    skillDimensions: ['pattern_recognition', 'computer_vision', 'analytical_thinking'],
    easy: [
      {
        q: 'A pixel represents:',
        options: ['An image sample', 'A CPU instruction', 'A network packet only', 'A transistor'],
        ans: 'A',
        explanation: 'A pixel (picture element) is the smallest addressable unit of color or intensity information in a raster image.'
      },
      {
        q: 'RGB images have how many standard color channels?',
        options: ['3', '1', '2', '8'],
        ans: 'A',
        explanation: 'RGB digital images combine Red, Green, and Blue spectral channels to reproduce the full human-visible color spectrum.'
      },
      {
        q: 'Grayscale images typically represent:',
        options: ['Intensity', 'Only depth', 'Only temperature', 'Network bandwidth'],
        ans: 'A',
        explanation: 'Grayscale images carry solely luminous intensity (brightness) values per pixel, omitting chrominance information.'
      },
      {
        q: 'OpenCV is widely used for:',
        options: ['Computer vision and image processing', 'Database hosting', 'PCB fabrication', 'Operating-system booting'],
        ans: 'A',
        explanation: 'OpenCV (Open Source Computer Vision Library) is the preeminent open-source library for real-time computer vision and image manipulation.'
      },
      {
        q: 'Edge detection aims to find:',
        options: ['Rapid intensity changes', 'Only image filenames', 'CPU cores', 'Network ports'],
        ans: 'A',
        explanation: 'Edge detection algorithms identify boundary points where digital image brightness sharply discontinues or exhibits steep gradients.'
      }
    ],
    medium: [
      {
        q: 'A Gaussian blur is commonly used for:',
        options: ['Noise reduction/smoothing', 'Increasing image resolution perfectly', 'Database encryption', 'Object labeling'],
        ans: 'A',
        explanation: 'Convolving an image with a 2D Gaussian kernel acts as a low-pass spatial filter, attenuating high-frequency pixel noise and grain.'
      },
      {
        q: 'Thresholding converts an image into regions based on:',
        options: ['Pixel intensity criteria', 'CPU speed', 'File extension', 'Antenna gain'],
        ans: 'A',
        explanation: 'Image thresholding classifies pixels into foreground or background binary masks depending on whether intensity surpasses a chosen scalar threshold.'
      },
      {
        q: 'Convolution kernels are used in image processing to:',
        options: ['Apply local spatial operations', 'Increase RAM', 'Change file permissions', 'Create network routes'],
        ans: 'A',
        explanation: 'A 2D kernel matrix slides over spatial pixels performing weighted sum operations for sharpening, blurring, edge detection, or feature extraction.'
      },
      {
        q: 'Histogram equalization primarily improves:',
        options: ['Contrast distribution', 'Image file naming', 'CPU frequency', 'Network bandwidth'],
        ans: 'A',
        explanation: 'Histogram equalization redistributes the most frequent intensity pixel values across the entire dynamic range, boosting visual contrast.'
      },
      {
        q: 'Morphological erosion generally:',
        options: ['Shrinks foreground regions', 'Always enlarges objects', 'Adds color channels', 'Increases frame rate'],
        ans: 'A',
        explanation: 'Erosion peels away layers of boundary pixels from foreground shapes using a structuring element, eroding small protrusions and noise.'
      }
    ],
    hard: [
      {
        q: 'Non-maximum suppression in object detection is used to:',
        options: ['Remove highly overlapping redundant bounding boxes', 'Increase image dimensions', 'Convert RGB to grayscale', 'Train a database'],
        ans: 'A',
        explanation: 'NMS eliminates duplicate candidate bounding boxes that overlap with higher-confidence detections beyond an Intersection over Union (IoU) threshold.'
      },
      {
        q: 'IoU measures:',
        options: ['Overlap between predicted and ground-truth boxes', 'Image brightness', 'CPU utilization', 'Network latency'],
        ans: 'A',
        explanation: 'Intersection over Union (IoU) calculates the area of overlap divided by the area of union between predicted and ground-truth bounding bounding boxes.'
      },
      {
        q: 'Precision in object detection is:',
        options: ['TP/(TP+FP)', 'TP/(TP+FN)', 'TN/(TN+FP)', 'FP/(TP+FP)'],
        ans: 'A',
        explanation: 'Precision measures detection accuracy: the fraction of all model-positive detections that are true positive ground-truth instances (TP / (TP + FP)).'
      },
      {
        q: 'A convolutional neural network learns spatial features mainly through:',
        options: ['Convolutional filters and learned representations', 'Manual SQL queries', 'RF matching', 'UART frames'],
        ans: 'A',
        explanation: 'CNNs utilize hierarchical sets of learnable 2D/3D filter kernels that extract localized edge, texture, shape, and semantic representations.'
      },
      {
        q: 'Increasing detection confidence threshold generally:',
        options: ['Reduces low-confidence detections and may reduce recall', 'Always increases recall', 'Changes image resolution', 'Removes training data'],
        ans: 'A',
        explanation: 'Raising the minimum confidence cutoff filters out false positives (improving precision) but risks missing subtle true objects (decreasing recall).'
      }
    ]
  },

  // 8. Automation & Control
  {
    domainId: 'automation_control',
    domainName: 'Automation & Control',
    category: 'Control Systems & Instrumentation',
    skillDimensions: ['control_systems', 'system_thinking', 'problem_solving'],
    easy: [
      {
        q: 'A PLC is commonly used for:',
        options: ['Industrial control', 'Image compression', 'Web browsing', 'Audio playback only'],
        ans: 'A',
        explanation: 'A Programmable Logic Controller (PLC) is an industrial hardened digital computer ruggedized for manufacturing automation and process control.'
      },
      {
        q: 'A sensor measures:',
        options: ['A physical quantity', 'Only software bugs', 'Database rows', 'Source-code length'],
        ans: 'A',
        explanation: 'Sensors detect physical properties (temperature, pressure, displacement, light) and convert them into measurable electronic signals.'
      },
      {
        q: 'An actuator:',
        options: ['Produces physical action from a control signal', 'Stores source code', 'Only measures temperature', 'Only receives Wi-Fi'],
        ans: 'A',
        explanation: 'Actuators take low-power controller commands and convert them into physical movement or mechanical force.'
      },
      {
        q: 'PID stands for:',
        options: ['Proportional-Integral-Derivative', 'Power-Input-Digital', 'Process-Internet-Device', 'Parallel-Integrated-Driver'],
        ans: 'A',
        explanation: 'PID stands for Proportional-Integral-Derivative, the widely deployed feedback control loop mechanism in industrial processes.'
      },
      {
        q: 'A feedback control system uses:',
        options: ['Measured output information', 'Only the input command', 'No sensors', 'Only open-loop timing'],
        ans: 'A',
        explanation: 'Closed-loop feedback systems continuously monitor process outputs and compare them against desired setpoints to correct error dynamics.'
      }
    ],
    medium: [
      {
        q: 'Increasing proportional gain in a PID controller generally:',
        options: ['Reduces error but can increase overshoot/oscillation', 'Always removes noise', 'Stops feedback', 'Eliminates all delay'],
        ans: 'A',
        explanation: 'Higher proportional gain Kp accelerates system response and shrinks steady-state error, but excessive gain induces overshoot and oscillatory instability.'
      },
      {
        q: 'Integral action primarily helps eliminate:',
        options: ['Steady-state error', 'Sensor existence', 'Sampling', 'Actuator power'],
        ans: 'A',
        explanation: 'The integral term accumulates past errors over time, continually ramping control effort until residual steady-state offset is driven to zero.'
      },
      {
        q: 'Derivative action responds to:',
        options: ['Rate of change of error', 'Only accumulated error', 'Only setpoint magnitude', 'Battery voltage'],
        ans: 'A',
        explanation: 'The derivative term evaluates the slope (rate of change) of the error signal, providing anticipatory damping to reduce overshoot.'
      },
      {
        q: 'An open-loop system:',
        options: ['Does not use output feedback', 'Always uses two sensors', 'Requires PID', 'Cannot have an actuator'],
        ans: 'A',
        explanation: 'Open-loop control systems execute input commands directly without measuring or feeding back the actual resulting output state.'
      },
      {
        q: 'A PLC scan cycle commonly includes:',
        options: ['Input read, program execution, output update', 'Only output update', 'Only compilation', 'Only network login'],
        ans: 'A',
        explanation: 'A standard PLC operates in cyclic loops: sampling physical inputs, solving ladder/structured-text logic, and writing updated outputs to actuators.'
      }
    ],
    hard: [
      {
        q: 'A stable closed-loop system should have:',
        options: ['Bounded response for bounded inputs under standard stability conditions', 'Unbounded oscillations', 'No feedback', 'Infinite gain'],
        ans: 'A',
        explanation: 'BIBO stability mandates that any bounded input produce a strictly bounded output, with all closed-loop transfer function poles residing in the left-half s-plane.'
      },
      {
        q: 'Root locus is used to study:',
        options: ['Closed-loop pole movement with gain', 'PCB traces', 'Sensor calibration only', 'Network packets'],
        ans: 'A',
        explanation: 'Root locus plots the trajectories of closed-loop system poles on the complex s-plane as an open-loop controller gain parameter varies from 0 to infinity.'
      },
      {
        q: 'Integral windup can occur when:',
        options: ['The actuator saturates while integral error continues accumulating', 'The sensor is disconnected permanently', 'Derivative gain is zero', 'The PLC is powered off'],
        ans: 'A',
        explanation: 'When an actuator hits its physical ceiling, the loop cannot correct further, causing the integrator to wind up excessively and causing massive overshoot.'
      },
      {
        q: 'A state-space model represents a system using:',
        options: ['State variables and first-order differential/difference equations', 'Only a transfer-function numerator', 'Only sensor names', 'Only PLC addresses'],
        ans: 'A',
        explanation: 'State-space representation uses vector-matrix differential equations dx/dt = Ax + Bu and y = Cx + Du to capture internal system states.'
      },
      {
        q: 'A lead compensator is commonly used to improve:',
        options: ['Transient response and phase margin', 'Battery chemistry', 'Image resolution', 'Database capacity'],
        ans: 'A',
        explanation: 'A phase-lead network injects positive phase lead around crossover frequencies, increasing phase margin and accelerating transient settling time.'
      }
    ]
  },

  // 9. Robotics
  {
    domainId: 'robotics',
    domainName: 'Robotics',
    category: 'Robotics & Automation',
    skillDimensions: ['kinematics', 'mechatronics', 'system_thinking'],
    easy: [
      {
        q: 'A robot actuator is used to:',
        options: ['Produce motion', 'Store images', 'Compile code', 'Measure internet speed'],
        ans: 'A',
        explanation: 'Robot actuators (servo motors, stepper motors, hydraulic rams) convert stored energy into physical mechanical joint movement.'
      },
      {
        q: 'A robot sensor provides:',
        options: ['Information about the robot or environment', 'Only mechanical power', 'Only source code', 'Only battery current'],
        ans: 'A',
        explanation: 'Robot sensors (encoders, IMUs, cameras, tactile touch) furnish proprioceptive joint status and exteroceptive environmental measurements.'
      },
      {
        q: 'A robot arm\'s end-effector is:',
        options: ['The tool/device at the end of the manipulator', 'The battery', 'The controller board', 'The base motor only'],
        ans: 'A',
        explanation: 'The end-effector is the terminal peripheral mounted on the robot wrist, such as a parallel gripper, vacuum cup, or welding torch.'
      },
      {
        q: 'LiDAR primarily measures:',
        options: ['Distance using laser light', 'Temperature only', 'CPU speed', 'Battery chemistry'],
        ans: 'A',
        explanation: 'LiDAR (Light Detection and Ranging) emits pulsed laser beams and calculates time-of-flight reflections to construct dense 3D distance point clouds.'
      },
      {
        q: 'ROS is widely associated with:',
        options: ['Robot software development', 'RF cable manufacturing', 'Database design only', 'PCB etching'],
        ans: 'A',
        explanation: 'ROS (Robot Operating System) is the global middleware framework providing hardware abstraction, device drivers, and inter-process messaging for robotics.'
      }
    ],
    medium: [
      {
        q: 'Forward kinematics determines:',
        options: ['End-effector pose from joint variables', 'Joint variables from desired pose', 'Battery voltage', 'Sensor noise only'],
        ans: 'A',
        explanation: 'Forward kinematics uses known kinematic link lengths and joint angles/displacements to compute the spatial 3D pose of the robot end-effector.'
      },
      {
        q: 'Inverse kinematics determines:',
        options: ['Joint configurations for a desired end-effector pose', 'Image color', 'Motor resistance', 'Network bandwidth'],
        ans: 'A',
        explanation: 'Inverse kinematics computes the necessary joint angles and actuator displacements required to position the end-effector at a target spatial coordinate.'
      },
      {
        q: 'A PID controller in robotics can be used for:',
        options: ['Joint position/velocity control', 'Database indexing', 'Image compression', 'RF matching'],
        ans: 'A',
        explanation: 'PID loops continuously regulate motor voltage or torque to track commanded trajectory positions and velocities while resisting load disturbances.'
      },
      {
        q: 'SLAM stands for:',
        options: ['Simultaneous Localization and Mapping', 'Signal Logic and Motor', 'Sensor Level Analog Mode', 'System Learning and Memory'],
        ans: 'A',
        explanation: 'SLAM enables an autonomous vehicle to construct a map of an unknown environment while concurrently tracking its own localized position within that map.'
      },
      {
        q: 'A robot\'s degrees of freedom indicate:',
        options: ['Independent motion variables', 'Number of batteries', 'Number of sensors only', 'Software version'],
        ans: 'A',
        explanation: 'Degrees of Freedom (DoF) represent the number of independent coordinates or joint variables needed to completely specify the configuration of a robotic mechanism.'
      }
    ],
    hard: [
      {
        q: 'A Jacobian matrix relates:',
        options: ['Joint velocities to end-effector velocities', 'Battery voltage to temperature', 'Pixels to file size', 'Network packets to ports'],
        ans: 'A',
        explanation: 'The kinematic Jacobian J(q) provides the linear transformation mapping joint space velocities dq/dt into Cartesian end-effector velocities dx/dt.'
      },
      {
        q: 'Singularity in a manipulator can cause:',
        options: ['Loss of certain motion directions and problematic joint velocities', 'More battery capacity', 'Automatic calibration', 'Higher image resolution'],
        ans: 'A',
        explanation: 'At a kinematic singularity, the Jacobian matrix drops rank, causing the robot to lose degrees of freedom and requiring infinite joint velocities for Cartesian motion.'
      },
      {
        q: 'Path planning primarily seeks:',
        options: ['A feasible collision-free route from start to goal', 'Only motor current', 'Only sensor calibration', 'Only camera exposure'],
        ans: 'A',
        explanation: 'Motion path planning algorithms (A*, RRT, PRM) search configuration space to find a kinematically feasible and collision-free trajectory from origin to destination.'
      },
      {
        q: 'An extended Kalman filter is commonly used for:',
        options: ['State estimation with nonlinear models/measurements', 'PCB routing', 'Database normalization', 'Audio playback'],
        ans: 'A',
        explanation: 'The Extended Kalman Filter (EKF) linearizes nonlinear system dynamics and sensor models using Taylor series expansions for optimal state estimation.'
      },
      {
        q: 'Sensor fusion combines:',
        options: ['Measurements from multiple sensors to improve estimation', 'Only motor commands', 'Only battery cells', 'Only images without processing'],
        ans: 'A',
        explanation: 'Sensor fusion synthesizes multi-modal data from disparate sensors (e.g. IMU, wheel odometry, camera, LiDAR) to produce accurate, redundant state estimates.'
      }
    ]
  },

  // 10. Hardware / PCB Design
  {
    domainId: 'hardware_pcb_design',
    domainName: 'Hardware / PCB Design',
    category: 'Hardware & Circuit Design',
    skillDimensions: ['circuit_design', 'hardware_layout', 'attention_to_detail'],
    easy: [
      {
        q: 'PCB stands for:',
        options: ['Printed Circuit Board', 'Power Control Battery', 'Programmable Circuit Bus', 'Parallel Component Board'],
        ans: 'A',
        explanation: 'PCB stands for Printed Circuit Board, the foundational mechanical substrate that electrically connects electronic components using copper conductive traces.'
      },
      {
        q: 'A resistor primarily:',
        options: ['Limits current and creates voltage relationships', 'Stores digital files', 'Generates software interrupts', 'Measures distance'],
        ans: 'A',
        explanation: 'A resistor provides electrical resistance according to Ohm\'s law (V = IR), establishing bias points, limiting currents, and forming voltage dividers.'
      },
      {
        q: 'A capacitor stores energy in an:',
        options: ['Electric field', 'Magnetic field only', 'Image file', 'Network packet'],
        ans: 'A',
        explanation: 'A capacitor stores potential energy electrostatically across dielectric insulation separating charged conducting plates (E = 0.5 * C * V^2).'
      },
      {
        q: 'A diode mainly allows current to flow:',
        options: ['Preferentially in one direction', 'Equally in all directions', 'Only at zero voltage', 'Only through software'],
        ans: 'A',
        explanation: 'A semiconductor diode conducts current readily in forward-bias (anode to cathode) while blocking reverse current flow under normal operating conditions.'
      },
      {
        q: 'A multimeter can measure:',
        options: ['Voltage, current and resistance', 'Only software speed', 'Only image resolution', 'Only network bandwidth'],
        ans: 'A',
        explanation: 'A digital multimeter (DMM) is a multi-function electronic test instrument used to measure voltage (volts), current (amperes), and resistance (ohms).'
      }
    ],
    medium: [
      {
        q: 'A decoupling capacitor near an IC helps:',
        options: ['Reduce local supply noise/transients', 'Increase code size', 'Improve antenna gain automatically', 'Store firmware'],
        ans: 'A',
        explanation: 'Decoupling (bypass) capacitors placed adjacent to IC power pins supply localized surge currents, shunting high-frequency switching noise to ground.'
      },
      {
        q: 'A ground plane can help reduce:',
        options: ['Return-path impedance and EMI', 'CPU instruction count', 'Database size', 'Sensor resolution'],
        ans: 'A',
        explanation: 'A solid copper ground plane provides an ultra-low impedance return path for high-frequency signals, minimizing loop inductance and electromagnetic interference (EMI).'
      },
      {
        q: 'Differential signaling helps reject:',
        options: ['Common-mode noise', 'All power loss', 'All thermal noise', 'All clock skew'],
        ans: 'A',
        explanation: 'Differential pairs transmit complementary signals; since external electromagnetic noise couples equally onto both conductors, receiver subtraction cancels the common-mode noise.'
      },
      {
        q: 'A via in a multilayer PCB is used to:',
        options: ['Connect traces between layers', 'Store charge permanently', 'Act as a processor', 'Measure temperature'],
        ans: 'A',
        explanation: 'A via is a plated hole drilled through the PCB substrate that creates vertical electrical connectivity between different copper routing layers.'
      },
      {
        q: 'DRC in PCB design checks:',
        options: ['Design-rule violations', 'Database rows', 'Software bugs only', 'RF modulation'],
        ans: 'A',
        explanation: 'Design Rule Checking (DRC) programmatically validates PCB layouts against fabrication tolerances (trace clearance, annular rings, trace widths, drill sizes).'
      }
    ],
    hard: [
      {
        q: 'Controlled impedance traces are important for:',
        options: ['High-speed signal integrity', 'Low-frequency switches only', 'Mechanical screws', 'Battery labeling'],
        ans: 'A',
        explanation: 'When signal rise times are shorter than round-trip propagation delays, transmission line traces must maintain matched characteristic impedance to prevent signal reflections.'
      },
      {
        q: 'Crosstalk is caused by:',
        options: ['Unwanted coupling between nearby signal paths', 'Only software errors', 'Battery discharge', 'PCB color'],
        ans: 'A',
        explanation: 'Crosstalk results from parasitic mutual capacitive and inductive coupling between adjacent PCB traces routing high-speed switching signals.'
      },
      {
        q: 'A star ground may be useful when:',
        options: ['Separating sensitive return currents in appropriate mixed-signal designs', 'Every design needs zero ground impedance', 'Only using batteries', 'No analog circuits exist'],
        ans: 'A',
        explanation: 'Star grounding ties multiple distinct ground returns (e.g. analog, digital, power) together at a single reference point to prevent noisy digital return currents from corrupting analog circuits.'
      },
      {
        q: 'Thermal vias are commonly used to:',
        options: ['Transfer heat from components into a PCB plane/heatsink structure', 'Increase network speed', 'Store firmware', 'Improve camera focus'],
        ans: 'A',
        explanation: 'Thermal vias placed under high-power surface-mount packages conduct dissipated heat downward into internal copper planes and bottom-side heatsinks.'
      },
      {
        q: 'For a high-speed PCB, minimizing discontinuities helps reduce:',
        options: ['Reflections and signal-integrity problems', 'Source-code errors', 'Database latency', 'Battery capacity'],
        ans: 'A',
        explanation: 'Impedance discontinuities (sharp 90-degree corners, stubs, via transitions, neck-downs) reflect signal energy, deteriorating eye diagrams and timing margins.'
      }
    ]
  },

  // 11. Automotive Electronics
  {
    domainId: 'automotive_electronics',
    domainName: 'Automotive Electronics',
    category: 'Automotive Systems',
    skillDimensions: ['safety_critical_systems', 'automotive_protocols', 'embedded_systems'],
    easy: [
      {
        q: 'ECU stands for:',
        options: ['Electronic Control Unit', 'Electrical Coding Utility', 'Engine Communication User', 'Embedded Circuit USB'],
        ans: 'A',
        explanation: 'An ECU (Electronic Control Unit) is an embedded microprocessor module that governs electrical systems and subsystems in motor vehicles.'
      },
      {
        q: 'ABS helps prevent:',
        options: ['Wheel lock during braking', 'Engine oil leakage', 'Battery charging', 'Radio interference'],
        ans: 'A',
        explanation: 'Anti-lock Braking Systems (ABS) rapidly modulate hydraulic brake pressure during emergency stops to prevent wheels from locking, maintaining tractive steering control.'
      },
      {
        q: 'An automotive sensor can measure:',
        options: ['Engine temperature', 'Only internet speed', 'Only file size', 'Only screen brightness'],
        ans: 'A',
        explanation: 'Automotive sensors monitor vehicle physical variables such as coolant temperature, manifold air pressure, crankshaft position, and wheel speed.'
      },
      {
        q: 'CAN is commonly used for:',
        options: ['In-vehicle communication', 'Web page design', 'Image compression', 'PCB fabrication'],
        ans: 'A',
        explanation: 'Controller Area Network (CAN) is the robust, balanced two-wire serial vehicle bus standard allowing ECUs to communicate without a host computer.'
      },
      {
        q: 'An airbag system is an example of:',
        options: ['Safety-critical automotive electronics', 'Entertainment software only', 'Database software', 'RF test equipment'],
        ans: 'A',
        explanation: 'Airbag deployers are safety-critical systems with strict real-time deterministic millisecond firing constraints to safeguard vehicle occupants during collisions.'
      }
    ],
    medium: [
      {
        q: 'CAN arbitration gives priority based on:',
        options: ['Message identifier', 'Message payload color', 'Battery size', 'Screen resolution'],
        ans: 'A',
        explanation: 'CAN uses bitwise CSMA/CD+NBA arbitration: lower numerical message identifier values represent dominant bits, winning bus access without message corruption.'
      },
      {
        q: 'An ECU often uses a microcontroller to:',
        options: ['Read sensors and control actuators', 'Only store music', 'Only connect to Wi-Fi', 'Only display maps'],
        ans: 'A',
        explanation: 'Automotive ECUs process raw sensor feedback (crank sensors, oxygen sensors, throttle position) to calculate and trigger actuator outputs (fuel injection, spark ignition).'
      },
      {
        q: 'Automotive radar is commonly used for:',
        options: ['Object detection and ranging', 'Oil filtration', 'Battery chemistry', 'Software compilation'],
        ans: 'A',
        explanation: 'Millimeter-wave radar (77 GHz) senses relative distance, velocity, and angle of obstacle vehicles in ADAS adaptive cruise control and automatic emergency braking.'
      },
      {
        q: 'ADAS stands for:',
        options: ['Advanced Driver Assistance Systems', 'Analog Data and Sensor', 'Automotive Digital Audio System', 'Automatic Device Address Service'],
        ans: 'A',
        explanation: 'ADAS encompasses intelligent vehicular electronic systems (lane keeping, collision avoidance, parking assist) engineered to elevate automotive safety.'
      },
      {
        q: 'LIN is generally used for:',
        options: ['Lower-cost, lower-speed vehicle networking', 'High-end cloud computing', 'Satellite communication', 'PCB imaging'],
        ans: 'A',
        explanation: 'Local Interconnect Network (LIN) is a single-wire, low-cost sub-bus designed for non-critical mechatronic body components (mirrors, wipers, seat adjustment).'
      }
    ],
    hard: [
      {
        q: 'Functional safety in automotive systems is associated with:',
        options: ['Reducing risks from malfunctioning electrical/electronic systems', 'Increasing screen brightness', 'Reducing software size only', 'Improving audio quality'],
        ans: 'A',
        explanation: 'Functional safety targets the absence of unreasonable risk caused by hazards resulting from systematic failures or random hardware breakdowns in E/E systems.'
      },
      {
        q: 'ASIL is part of:',
        options: ['ISO 26262 functional safety classification', 'Ethernet physical-layer coding', 'Battery chemistry', 'GPS positioning'],
        ans: 'A',
        explanation: 'Automotive Safety Integrity Level (ASIL A through D) is defined in ISO 26262 to classify risk severity, exposure frequency, and controllability of automotive systems.'
      },
      {
        q: 'Automotive Ethernet is useful for:',
        options: ['High-bandwidth in-vehicle data communication', 'Only analog sensors', 'Only airbag deployment', 'Only engine oil control'],
        ans: 'A',
        explanation: 'Automotive Ethernet (100BASE-T1 / 1000BASE-T1) enables point-to-point unshielded twisted pair data transfer required for high-bandwidth ADAS cameras and lidar.'
      },
      {
        q: 'Sensor fusion in ADAS can combine:',
        options: ['Radar, camera and other sensor measurements', 'Only dashboard LEDs', 'Only engine temperature', 'Only one CAN frame'],
        ans: 'A',
        explanation: 'Sensor fusion correlates camera visual classification with radar distance and velocity measurements to produce a unified, robust 360-degree environmental perception.'
      },
      {
        q: 'A watchdog in an automotive ECU can help:',
        options: ['Detect and recover from certain software failures', 'Increase tire pressure', 'Improve fuel chemistry', 'Replace all sensors'],
        ans: 'A',
        explanation: 'Automotive windowed watchdogs verify timing execution correctness, safely forcing ECU fail-safe reset or degraded operational mode if software hangs.'
      }
    ]
  },

  // 12. Power Electronics
  {
    domainId: 'power_electronics',
    domainName: 'Power Electronics',
    category: 'Power Systems & Energy',
    skillDimensions: ['power_conversion', 'circuit_analysis', 'system_thinking'],
    easy: [
      {
        q: 'A rectifier converts:',
        options: ['AC to DC', 'DC to AC', 'DC to DC only', 'AC to AC only'],
        ans: 'A',
        explanation: 'A rectifier utilizes diodes or controlled thyristors to convert bidirectional Alternating Current (AC) into unidirectional Direct Current (DC).'
      },
      {
        q: 'An inverter converts:',
        options: ['DC to AC', 'AC to DC', 'AC to data', 'Data to DC'],
        ans: 'A',
        explanation: 'An inverter uses high-speed semiconductor switches to convert continuous DC voltage into alternating AC output voltage at commanded frequencies.'
      },
      {
        q: 'A transformer operates using:',
        options: ['Electromagnetic induction', 'Software interrupts', 'Digital filtering', 'Thermal expansion'],
        ans: 'A',
        explanation: 'Transformers transfer electrical energy between coupled coils via Faraday\'s law of mutual electromagnetic induction through a magnetic core.'
      },
      {
        q: 'A MOSFET can act as:',
        options: ['A power switching device', 'Only a sensor', 'Only a capacitor', 'Only an antenna'],
        ans: 'A',
        explanation: 'Power MOSFETs function as highly efficient, fast-switching electronic valves controlled by gate-to-source voltage in power conversion circuits.'
      },
      {
        q: 'A battery stores:',
        options: ['Electrical energy chemically', 'Only RF waves', 'Only source code', 'Only heat'],
        ans: 'A',
        explanation: 'Electrochemical cells store potential electrical energy in the chemical bonds of cathode and anode active materials, released via redox reactions.'
      }
    ],
    medium: [
      {
        q: 'A buck converter generally:',
        options: ['Steps DC voltage down', 'Steps AC frequency up', 'Converts data to analog', 'Measures resistance'],
        ans: 'A',
        explanation: 'A buck converter is a step-down switch-mode DC-DC converter that efficiently drops high input DC voltage to a lower regulated DC output.'
      },
      {
        q: 'A boost converter generally:',
        options: ['Steps DC voltage up', 'Always steps voltage down', 'Converts AC to audio', 'Measures current only'],
        ans: 'A',
        explanation: 'A boost converter is a step-up switch-mode DC-DC power supply that produces an output DC voltage higher than its input voltage.'
      },
      {
        q: 'PWM controls average output power by changing:',
        options: ['Switch duty cycle', 'Only resistance', 'Only frequency of mains', 'Only battery chemistry'],
        ans: 'A',
        explanation: 'Pulse-Width Modulation adjusts the ratio of on-time to total switching period (duty ratio D = Ton / T) to govern average output voltage and power.'
      },
      {
        q: 'A flyback converter is a type of:',
        options: ['Switch-mode power converter', 'Sensor', 'Motor encoder', 'Communication protocol'],
        ans: 'A',
        explanation: 'A flyback converter is an isolated buck-boost topology utilizing a coupled inductor (flyback transformer) to store energy during the on-phase and deliver it during the off-phase.'
      },
      {
        q: 'Power factor correction aims to:',
        options: ['Improve input current waveform/power factor', 'Increase RAM', 'Reduce image noise', 'Change processor architecture'],
        ans: 'A',
        explanation: 'PFC circuits shape AC input current into phase with AC mains voltage, minimizing harmonic distortion (THD) and maximizing real usable power extraction.'
      }
    ],
    hard: [
      {
        q: 'Switching losses in a power device are strongly influenced by:',
        options: ['Switching frequency and transition behavior', 'Only PCB color', 'Only battery capacity', 'Only sensor resolution'],
        ans: 'A',
        explanation: 'During turn-on and turn-off transition intervals, simultaneous non-zero voltage across and current through the switch creates instantaneous VI power loss directly scaling with frequency.'
      },
      {
        q: 'Soft switching techniques aim to:',
        options: ['Reduce switching losses by switching near favorable voltage/current conditions', 'Increase resistance intentionally', 'Eliminate inductors', 'Remove feedback'],
        ans: 'A',
        explanation: 'Soft switching utilizes resonant LC networks to enact Zero Voltage Switching (ZVS) or Zero Current Switching (ZCS), slashing transient switching overlap losses.'
      },
      {
        q: 'An LLC resonant converter uses:',
        options: ['Resonant inductive/capacitive elements for efficient conversion', 'Only resistors', 'Only batteries', 'Only antennas'],
        ans: 'A',
        explanation: 'LLC resonant topologies combine two inductors and one capacitor to achieve high-efficiency soft switching across wide input and load variations.'
      },
      {
        q: 'Dead time in a half-bridge helps prevent:',
        options: ['Shoot-through of high- and low-side switches', 'All electromagnetic radiation', 'Battery overcharging automatically', 'Data corruption'],
        ans: 'A',
        explanation: 'Dead time inserts a brief non-conduction delay between turning off one bridge switch and turning on the opposing switch to prevent catastrophic cross-conduction (shoot-through).'
      },
      {
        q: 'An isolated DC-DC converter provides:',
        options: ['Galvanic isolation between input and output', 'Only voltage measurement', 'Only frequency conversion', 'Only software isolation'],
        ans: 'A',
        explanation: 'Galvanic isolation breaks physical DC conduction paths between input and output using magnetic transformer coupling, enhancing human safety and noise immunity.'
      }
    ]
  },

  // 13. Medical Electronics
  {
    domainId: 'medical_electronics',
    domainName: 'Medical Electronics',
    category: 'Biomedical & Healthcare',
    skillDimensions: ['biomedical_instrumentation', 'safety_critical_systems', 'signal_analysis'],
    easy: [
      {
        q: 'ECG measures:',
        options: ['Electrical activity of the heart', 'Blood glucose directly', 'Bone density only', 'Lung volume only'],
        ans: 'A',
        explanation: 'Electrocardiography (ECG) records cardiac bioelectric potentials generated by the polarization and depolarization of myocardium tissue during cardiac cycles.'
      },
      {
        q: 'A pulse oximeter estimates:',
        options: ['Blood oxygen saturation and pulse rate', 'Brain waves only', 'Blood pressure only', 'Bone temperature'],
        ans: 'A',
        explanation: 'Pulse oximeters measure optical absorption of red (660nm) and infrared (940nm) light through pulsating vascular tissue to compute arterial oxygen saturation (SpO2).'
      },
      {
        q: 'A sensor in medical equipment converts:',
        options: ['A physical/biological quantity into a measurable signal', 'Code into electricity only', 'A database into an image', 'RF into software'],
        ans: 'A',
        explanation: 'Biomedical sensors transduce physiological events (body temperature, biopotentials, blood flow velocity) into proportional electrical signals.'
      },
      {
        q: 'A thermometer measures:',
        options: ['Temperature', 'Heart rhythm only', 'Blood pressure only', 'Oxygen concentration only'],
        ans: 'A',
        explanation: 'Clinical thermometers assess thermal energy (body temperature) using resistive thermistors, RTDs, or infrared radiation detection.'
      },
      {
        q: 'MRI primarily uses:',
        options: ['Strong magnetic fields and radio-frequency signals', 'X-rays only', 'Ultrasound only', 'Visible light only'],
        ans: 'A',
        explanation: 'Magnetic Resonance Imaging (MRI) employs powerful static magnetic fields, spatial gradient fields, and RF pulses to align and perturb hydrogen proton spins in tissue.'
      }
    ],
    medium: [
      {
        q: 'An ECG amplifier needs high:',
        options: ['Input impedance and appropriate common-mode rejection', 'Output temperature', 'Battery resistance', 'Screen brightness'],
        ans: 'A',
        explanation: 'ECG bio-signals have high source impedance and millivolt amplitudes; high input impedance avoids electrode loading, while high CMRR rejects 50/60 Hz mains hum.'
      },
      {
        q: 'An instrumentation amplifier is useful for:',
        options: ['Accurate amplification of small differential signals', 'Powering motors', 'Generating RF carriers', 'Storing data'],
        ans: 'A',
        explanation: 'An instrumentation amplifier offers ultra-high input impedance, extremely high CMRR, low DC offset drift, and precise stable gain for biopotential measurement.'
      },
      {
        q: 'Electrical isolation in medical equipment can help:',
        options: ['Protect patients from hazardous leakage currents', 'Increase image color', 'Reduce file size', 'Increase CPU clock'],
        ans: 'A',
        explanation: 'Optocouplers and isolation transformers prevent dangerous microshock and macroshock leakage currents from flowing through patient-applied electrodes into ground.'
      },
      {
        q: 'Ultrasound imaging uses:',
        options: ['High-frequency acoustic waves', 'Gamma rays', 'Visible lasers only', 'DC magnetic fields only'],
        ans: 'A',
        explanation: 'Medical ultrasound utilizes piezoelectric transducers emitting 1-15 MHz acoustic sound waves, mapping reflected acoustic impedance echoes into real-time images.'
      },
      {
        q: 'A low-pass filter in biomedical signal processing can help remove:',
        options: ['High-frequency noise', 'All heart signals', 'All DC components', 'Battery voltage'],
        ans: 'A',
        explanation: 'Low-pass filtering attenuates high-frequency electromyographic (muscle tremor) noise and RF instrumentation interference above ECG diagnostic bandwidths.'
      }
    ],
    hard: [
      {
        q: 'Common-mode rejection is important in ECG because:',
        options: ['Interference may appear similarly on both measurement inputs', 'ECG has no differential signal', 'The heart generates RF only', 'It eliminates the need for electrodes'],
        ans: 'A',
        explanation: 'Capacitive coupling from ambient AC power lines induces identical common-mode interference voltages on patient skin that must be rejected by the differential amplifier.'
      },
      {
        q: 'An ADC used in biomedical acquisition should consider:',
        options: ['Sampling rate, resolution and input range', 'Only screen size', 'Only network speed', 'Only PCB thickness'],
        ans: 'A',
        explanation: 'Biomedical digitizers require high bit resolution (e.g. 16-24 bit) to capture small bio-signals superimposed on large DC half-cell electrode offset potentials.'
      },
      {
        q: 'Patient leakage current limits are important because:',
        options: ['Excess current through a patient can be hazardous', 'They improve image contrast', 'They increase CPU speed', 'They reduce database size'],
        ans: 'A',
        explanation: 'Medical electrical safety standards (IEC 60601-1) impose microampere limits on leakage current to eliminate ventricular fibrillation risks during cardiac catheterization.'
      },
      {
        q: 'Artifact removal in ECG may address:',
        options: ['Baseline wander, power-line interference and motion artifacts', 'Only file names', 'Only antenna mismatch', 'Only battery voltage'],
        ans: 'A',
        explanation: 'Clinical ECG preprocessing filters out low-frequency baseline drift from patient respiration, 50/60 Hz power-line interference, and cable/motion artifacts.'
      },
      {
        q: 'A defibrillator delivers:',
        options: ['A controlled electrical shock to restore certain abnormal cardiac rhythms', 'Continuous ultrasound', 'Only diagnostic ECG amplification', 'Only blood pressure measurement'],
        ans: 'A',
        explanation: 'Defibrillators discharge a calibrated therapeutic biphasic electrical energy pulse across the heart to depolarize myocardial cells and re-establish sinus rhythm during cardiac arrest.'
      }
    ]
  },

  // 14. Satellite / Aerospace / Avionics
  {
    domainId: 'satellite_aerospace_avionics',
    domainName: 'Satellite / Aerospace / Avionics',
    category: 'Aerospace & Avionics',
    skillDimensions: ['aerospace_systems', 'avionics_navigation', 'telecommunications'],
    easy: [
      {
        q: 'GPS is primarily used for:',
        options: ['Positioning, navigation and timing', 'Audio compression', 'PCB etching', 'Battery charging'],
        ans: 'A',
        explanation: 'The Global Positioning System (GPS) provides accurate three-dimensional positioning, velocity, and precise atomic clock timing (PNT) worldwide.'
      },
      {
        q: 'A satellite transponder commonly:',
        options: ['Receives, processes/amplifies and retransmits signals', 'Only stores images', 'Only measures temperature', 'Only generates software'],
        ans: 'A',
        explanation: 'A satellite transponder receives uplink radio signals at one frequency, downconverts them, amplifies the RF power, and retransmits on the downlink frequency.'
      },
      {
        q: 'Avionics refers to:',
        options: ['Electronic systems used in aircraft/space vehicles', 'Only aircraft engines', 'Only mechanical structures', 'Only airport software'],
        ans: 'A',
        explanation: 'Avionics is a portmanteau of "aviation electronics", comprising navigation, communication, flight management, and monitoring systems on aerospace vehicles.'
      },
      {
        q: 'Telemetry is used to:',
        options: ['Send measurements from a remote vehicle/system', 'Paint a PCB', 'Compile firmware', 'Increase battery voltage'],
        ans: 'A',
        explanation: 'Telemetry transmits operational measurements (temperatures, voltages, fuel levels, orbital trajectory) from spacecraft to Earth ground stations.'
      },
      {
        q: 'An IMU commonly contains:',
        options: ['Accelerometers and gyroscopes', 'Only a camera', 'Only a battery', 'Only an antenna'],
        ans: 'A',
        explanation: 'An Inertial Measurement Unit (IMU) incorporates multi-axis accelerometers and gyroscopes to measure linear acceleration and angular velocity.'
      }
    ],
    medium: [
      {
        q: 'A geostationary satellite appears stationary relative to:',
        options: ['A point on Earth\'s equator', 'Any point on Mars', 'The Moon only', 'A moving aircraft'],
        ans: 'A',
        explanation: 'A satellite in a circular geosynchronous orbit (~35,786 km altitude) directly above the equator orbits with an angular velocity matching Earth\'s rotation.'
      },
      {
        q: 'Satellite link budgets include:',
        options: ['Free-space loss, antenna gains and system losses', 'Only processor speed', 'Only battery capacity', 'Only screen size'],
        ans: 'A',
        explanation: 'A satellite link budget accounts for EIRP, free-space path loss, atmospheric absorption, antenna G/T ratios, and system noise temperatures to verify link margin.'
      },
      {
        q: 'Attitude determination means estimating:',
        options: ['Spacecraft orientation', 'Ground-station temperature', 'Engine fuel level only', 'Network password'],
        ans: 'A',
        explanation: 'Attitude determination algorithms estimate the 3D angular orientation of a spacecraft relative to an inertial reference frame using sun sensors, star trackers, and gyros.'
      },
      {
        q: 'A reaction wheel is used for:',
        options: ['Spacecraft attitude control', 'Fuel pumping', 'RF encryption', 'Image compression'],
        ans: 'A',
        explanation: 'Reaction wheels spin electric flywheels to impart counter-torques on the spacecraft body via conservation of angular momentum for precision pointing control.'
      },
      {
        q: 'An inertial navigation system uses:',
        options: ['Inertial sensors to estimate motion and position', 'Only Wi-Fi', 'Only a thermometer', 'Only a camera'],
        ans: 'A',
        explanation: 'An INS integrates acceleration and angular rate readings from dead-reckoning IMU sensors to continuously calculate vehicle velocity, position, and orientation.'
      }
    ],
    hard: [
      {
        q: 'Orbital velocity depends on:',
        options: ['Gravitational parameter and orbital radius for a circular orbit', 'Only satellite battery size', 'Only antenna gain', 'Only payload mass'],
        ans: 'A',
        explanation: 'For a circular orbit, orbital speed v = sqrt(mu / r), where mu is the central body gravitational parameter (GM) and r is the orbital radius from Earth\'s center.'
      },
      {
        q: 'Doppler shift in satellite communication is caused by:',
        options: ['Relative motion between transmitter and receiver', 'Only atmospheric temperature', 'Only battery voltage', 'Only antenna color'],
        ans: 'A',
        explanation: 'High relative velocity between low Earth orbit (LEO) satellites and ground receivers compresses or stretches incoming wave cycles, shifting received frequencies.'
      },
      {
        q: 'Attitude control is critical because it determines:',
        options: ['Vehicle orientation and pointing of instruments/antennas', 'Only CPU memory', 'Only fuel chemistry', 'Only software language'],
        ans: 'A',
        explanation: 'Attitude control aligns scientific payloads, keeps solar arrays oriented toward the sun for power generation, and steers high-gain antennas toward Earth ground targets.'
      },
      {
        q: 'Link margin represents:',
        options: ['Available received-signal margin above required threshold', 'CPU clock margin', 'Battery charge percentage', 'PCB trace width'],
        ans: 'A',
        explanation: 'Link margin is the excess signal-to-noise ratio in decibels (dB) available over the minimum receiver threshold required to maintain specified bit error rates.'
      },
      {
        q: 'Fault-tolerant avionics often use redundancy to:',
        options: ['Maintain operation despite certain component failures', 'Increase display brightness', 'Reduce antenna size', 'Eliminate all software'],
        ans: 'A',
        explanation: 'Aerospace avionics deploy triple modular redundancy (TMR) with voting mechanisms to guarantee uninterrupted flight control even if an isolated subsystem fails.'
      }
    ]
  },

  // 15. Semiconductor Testing
  {
    domainId: 'semiconductor_testing',
    domainName: 'Semiconductor Testing',
    category: 'Testing & Quality Assurance',
    skillDimensions: ['design_for_testability', 'quality_assurance', 'defect_analysis'],
    easy: [
      {
        q: 'A semiconductor test checks whether a chip:',
        options: ['Meets specified functional/electrical requirements', 'Has a good screen', 'Has enough storage files', 'Can browse the web'],
        ans: 'A',
        explanation: 'Semiconductor testing validates that manufactured integrated circuits operate correctly without manufacturing defects and satisfy electrical datasheets.'
      },
      {
        q: 'ATE stands for:',
        options: ['Automated Test Equipment', 'Analog Timing Engine', 'Automatic Transistor Encoder', 'Advanced Thermal Electronics'],
        ans: 'A',
        explanation: 'ATE (Automated Test Equipment) is computerized test instrumentation that rapidly executes functional and parametric tests on silicon wafers and packaged ICs.'
      },
      {
        q: 'A wafer contains:',
        options: ['Many semiconductor dies', 'Only one transistor', 'Only one PCB', 'Only software files'],
        ans: 'A',
        explanation: 'A circular semiconductor wafer (typically silicon, 200mm or 300mm) is fabricated containing hundreds or thousands of individual integrated circuit dies.'
      },
      {
        q: 'A die is:',
        options: ['An individual piece of semiconductor containing a circuit', 'A network cable', 'A battery', 'A software package'],
        ans: 'A',
        explanation: 'A die is a single uncut or diced silicon unit containing an entire functional integrated circuit prior to packaging.'
      },
      {
        q: 'A functional test checks:',
        options: ['Whether intended functions operate correctly', 'Only package color', 'Only file size', 'Only PCB dimensions'],
        ans: 'A',
        explanation: 'Functional testing stimulates digital chip inputs with test vectors to verify that the logic truth table and state transitions perform their intended functions.'
      }
    ],
    medium: [
      {
        q: 'Scan testing improves:',
        options: ['Controllability and observability of internal digital nodes', 'Battery capacity', 'Antenna gain', 'Screen resolution'],
        ans: 'A',
        explanation: 'Scan testing connects internal sequential flip-flops into serial shift registers in test mode, allowing tester equipment to shift in states and observe internal nodes.'
      },
      {
        q: 'A stuck-at fault models a node as:',
        options: ['Permanently 0 or permanently 1', 'Randomly changing every clock', 'Always analog', 'Disconnected from power only'],
        ans: 'A',
        explanation: 'The classic single stuck-at fault model assumes a circuit net is permanently tied to logic 0 (stuck-at-0) or logic 1 (stuck-at-1) due to physical silicon bridging or opens.'
      },
      {
        q: 'BIST stands for:',
        options: ['Built-In Self-Test', 'Binary Integrated Signal Transfer', 'Board Input Scan Timing', 'Bus Interface Software Test'],
        ans: 'A',
        explanation: 'Built-In Self-Test (BIST) embeds on-chip test pattern generators (LFSR) and response analyzers into the silicon design, enabling the chip to test itself.'
      },
      {
        q: 'Yield is the fraction of manufactured units that:',
        options: ['Meet required specifications', 'Have the largest die size', 'Use the most power', 'Contain the most transistors'],
        ans: 'A',
        explanation: 'Semiconductor manufacturing yield is the percentage of fabricated dies on a wafer that pass all electrical testing and meet operational specifications.'
      },
      {
        q: 'Parametric testing measures values such as:',
        options: ['Voltage, current, timing or leakage', 'Only software complexity', 'Only image quality', 'Only network speed'],
        ans: 'A',
        explanation: 'Parametric testing checks analog electrical characteristics (leakage current Iddq, threshold voltages, input/output levels, setup/hold times) against absolute limits.'
      }
    ],
    hard: [
      {
        q: 'ATPG generates:',
        options: ['Test patterns targeting modeled faults', 'PCB layouts', 'Software documentation', 'RF carriers'],
        ans: 'A',
        explanation: 'Automatic Test Pattern Generation (ATPG) algorithms (such as PODEM and D-algorithm) generate vector sequences specifically designed to detect modeled physical circuit faults.'
      },
      {
        q: 'Fault coverage indicates:',
        options: ['The proportion of modeled faults detected by tests', 'Percentage of battery remaining', 'Clock frequency', 'Number of PCB layers'],
        ans: 'A',
        explanation: 'Fault coverage is the percentage ratio of detected modeled faults over the total population of possible detectable circuit faults.'
      },
      {
        q: 'Transition-delay faults model:',
        options: ['Slow-to-rise or slow-to-fall behavior', 'Only stuck-at behavior', 'Only memory capacity', 'Only RF reflection'],
        ans: 'A',
        explanation: 'Transition-delay fault testing detects at-speed timing defects where a signal transitions between 0 and 1 correctly, but too sluggishly to meet clock deadlines.'
      },
      {
        q: 'IDDQ testing historically detects defects by measuring:',
        options: ['Quiescent supply current in CMOS circuits', 'Output sound', 'Antenna gain', 'CPU temperature only'],
        ans: 'A',
        explanation: 'Because ideal static CMOS circuits draw negligible quiescent DC leakage current, elevated IDDQ indicates bridging defects or short circuits.'
      },
      {
        q: 'Redundancy and repair in memories can improve:',
        options: ['Manufacturing yield by replacing defective rows/columns', 'RF bandwidth', 'PCB thickness', 'Software compilation speed'],
        ans: 'A',
        explanation: 'Semiconductor memory arrays include spare redundant rows and columns that can be laser-fused or electrically programmed to replace defective memory cells, saving dies.'
      }
    ]
  },

  // 16. AI / ML for ECE
  {
    domainId: 'aiml_ece',
    domainName: 'AI / ML for ECE',
    category: 'Edge AI & Embedded Intelligence',
    skillDimensions: ['machine_learning', 'edge_ai', 'pattern_recognition'],
    easy: [
      {
        q: 'AI stands for:',
        options: ['Artificial Intelligence', 'Analog Integration', 'Automatic Internet', 'Advanced Input'],
        ans: 'A',
        explanation: 'AI stands for Artificial Intelligence, the field of computer science developing systems that simulate human learning, perception, and problem-solving.'
      },
      {
        q: 'ML stands for:',
        options: ['Machine Learning', 'Memory Logic', 'Motor Link', 'Measured Latency'],
        ans: 'A',
        explanation: 'Machine Learning (ML) is a subset of AI focused on training statistical models on data to perform tasks without explicit programmatic rule definition.'
      },
      {
        q: 'A classification model predicts:',
        options: ['A class/category', 'Only a continuous waveform', 'Only PCB dimensions', 'Only network packets'],
        ans: 'A',
        explanation: 'Classification algorithms map input feature vectors into discrete categorical class labels (e.g. normal vs defective, digit recognition).'
      },
      {
        q: 'A training dataset is used to:',
        options: ['Learn model parameters/patterns', 'Power a sensor', 'Route PCB traces', 'Transmit RF signals'],
        ans: 'A',
        explanation: 'A training dataset provides labeled empirical examples that gradient descent optimization algorithms use to iteratively adjust model weights and biases.'
      },
      {
        q: 'A neural network contains interconnected:',
        options: ['Nodes/neurons and weighted connections', 'Only resistors', 'Only antennas', 'Only batteries'],
        ans: 'A',
        explanation: 'Artificial neural networks consist of interconnected computational nodes (artificial neurons) linked through learnable scalar weights.'
      }
    ],
    medium: [
      {
        q: 'Overfitting occurs when a model:',
        options: ['Fits training data well but generalizes poorly', 'Cannot learn training data at all', 'Has no parameters', 'Always has low accuracy'],
        ans: 'A',
        explanation: 'Overfitting occurs when a complex model memorizes idiosyncratic training noise and outliers, yielding degraded predictive performance on unseen validation data.'
      },
      {
        q: 'A validation set is commonly used to:',
        options: ['Tune/select models and hyperparameters', 'Replace all training data', 'Power the GPU', 'Measure antenna gain'],
        ans: 'A',
        explanation: 'A separate validation split assesses model generalization during training, serving as an objective benchmark to tune learning rates, epochs, and architecture hyperparameters.'
      },
      {
        q: 'Precision is:',
        options: ['TP/(TP+FP)', 'TP/(TP+FN)', 'TN/(TN+FN)', 'FP/(TP+TN)'],
        ans: 'A',
        explanation: 'Precision computes the ratio of true positive predictions relative to all instances predicted as positive (TP / (TP + FP)).'
      },
      {
        q: 'CNNs are particularly effective for:',
        options: ['Spatial data such as images', 'Only database tables', 'Only serial communication', 'Only power conversion'],
        ans: 'A',
        explanation: 'Convolutional Neural Networks excel on multidimensional spatial arrays (images, spectrograms) due to parameter sharing and translation invariance of convolution.'
      },
      {
        q: 'An activation function provides:',
        options: ['Nonlinearity in a neural network', 'Battery power', 'RF impedance matching', 'PCB isolation'],
        ans: 'A',
        explanation: 'Nonlinear activation functions (ReLU, Sigmoid, GELU) enable neural networks to approximate arbitrary nonlinear complex functions.'
      }
    ],
    hard: [
      {
        q: 'Quantization of a neural network generally means:',
        options: ['Representing weights/activations with lower numerical precision', 'Increasing every parameter to 64-bit', 'Removing all layers', 'Converting images to analog'],
        ans: 'A',
        explanation: 'Model quantization converts 32-bit floating-point (FP32) weights and activations into 8-bit integers (INT8), dramatically cutting memory footprint and accelerating Edge inference.'
      },
      {
        q: 'Edge AI emphasizes:',
        options: ['Running inference near the data source/device', 'Only training on paper', 'Only cloud storage', 'Only RF modulation'],
        ans: 'A',
        explanation: 'Edge AI executes neural network inference locally on microcontrollers, NPUs, or embedded gateways, reducing cloud latency, bandwidth consumption, and privacy leakage.'
      },
      {
        q: 'A confusion matrix summarizes:',
        options: ['Classification outcomes such as TP, TN, FP and FN', 'PCB trace lengths', 'RF frequencies', 'Battery voltages'],
        ans: 'A',
        explanation: 'A confusion matrix cross-tabulates predicted class labels against true ground-truth labels, detailing True Positives, True Negatives, False Positives, and False Negatives.'
      },
      {
        q: 'Transfer learning uses:',
        options: ['Knowledge from a pretrained model for a related task', 'Only unlabeled hardware', 'Only analog filters', 'Only network cables'],
        ans: 'A',
        explanation: 'Transfer learning repurposes intermediate representations learned by large models trained on vast datasets, fine-tuning them on smaller domain-specific tasks.'
      },
      {
        q: 'For an imbalanced classification dataset, accuracy can be misleading because:',
        options: ['The majority class can dominate the metric', 'Accuracy always equals recall', 'There are no classes', 'Models cannot be trained'],
        ans: 'A',
        explanation: 'In skewed datasets (e.g. 99% benign, 1% fault), a trivial model predicting only the majority class achieves 99% accuracy while detecting zero anomalies.'
      }
    ]
  },

  // 17. Software / IT
  {
    domainId: 'software_it',
    domainName: 'Software / IT',
    category: 'Software Engineering & IT',
    skillDimensions: ['software_engineering', 'web_technologies', 'system_architecture'],
    easy: [
      {
        q: 'HTML is primarily used to define:',
        options: ['Web page structure', 'Database indexes', 'RF signals', 'PCB traces'],
        ans: 'A',
        explanation: 'HyperText Markup Language (HTML) is the standard markup language used to structure elements, text, and multimedia on web documents.'
      },
      {
        q: 'CSS is primarily used for:',
        options: ['Web page styling', 'Database storage', 'CPU scheduling', 'Signal modulation'],
        ans: 'A',
        explanation: 'Cascading Style Sheets (CSS) describe the presentation, layout, visual colors, and responsive formatting of HTML documents.'
      },
      {
        q: 'JavaScript is commonly used for:',
        options: ['Web application programming', 'PCB manufacturing', 'RF antenna design', 'Battery chemistry'],
        ans: 'A',
        explanation: 'JavaScript is the high-level, interpreted programming language that powers dynamic interactivity and client-side logic across the web.'
      },
      {
        q: 'SQL is used to:',
        options: ['Query and manage relational databases', 'Design antennas', 'Control motors only', 'Render pixels physically'],
        ans: 'A',
        explanation: 'Structured Query Language (SQL) is the standardized domain-specific language for querying, updating, and managing relational database management systems.'
      },
      {
        q: 'Git is a:',
        options: ['Version control system', 'Database engine', 'Web browser', 'Microcontroller'],
        ans: 'A',
        explanation: 'Git is a distributed version control system designed to track source code changes and coordinate collaborative software development.'
      }
    ],
    medium: [
      {
        q: 'REST APIs commonly use:',
        options: ['HTTP methods such as GET, POST, PUT and DELETE', 'Only UART', 'Only SPI', 'Only VGA'],
        ans: 'A',
        explanation: 'Representational State Transfer (REST) web APIs use standard HTTP verbs (GET, POST, PUT, DELETE, PATCH) to perform stateless CRUD operations on resources.'
      },
      {
        q: 'JSON is commonly used for:',
        options: ['Structured data interchange', 'PCB etching', 'RF filtering', 'Motor lubrication'],
        ans: 'A',
        explanation: 'JavaScript Object Notation (JSON) is an open-standard, human-readable text format used for serializing and transmitting structured data over network APIs.'
      },
      {
        q: 'A primary key in a relational database:',
        options: ['Uniquely identifies a row', 'Stores only images', 'Must always be a password', 'Represents a network cable'],
        ans: 'A',
        explanation: 'A primary key is a unique constraint enforcing entity integrity, guaranteeing that each table record possesses a distinct, non-null identifier.'
      },
      {
        q: 'Docker containers package:',
        options: ['Applications and their dependencies in isolated environments', 'Only hardware circuits', 'Only databases without software', 'Only RF signals'],
        ans: 'A',
        explanation: 'Docker packages application code, runtime, system libraries, and settings into lightweight, portable, isolated containers executing on OS kernel namespaces.'
      },
      {
        q: 'Asynchronous programming is useful for:',
        options: ['Handling operations that may complete later without blocking execution', 'Increasing transistor count', 'Reducing antenna length', 'Changing AC to DC'],
        ans: 'A',
        explanation: 'Asynchronous event loops allow programs to initiate long-running I/O operations (file reading, network requests) without stalling the main execution thread.'
      }
    ],
    hard: [
      {
        q: 'A database index primarily improves:',
        options: ['Lookup/query performance at the cost of storage/write overhead', 'Image color depth', 'RF gain', 'CPU instruction width'],
        ans: 'A',
        explanation: 'Indexes (B-Trees, Hash maps) accelerate search queries by minimizing disk page reads, at the cost of additional storage overhead and slower write/insert times.'
      },
      {
        q: 'JWT is commonly used for:',
        options: ['Stateless authentication/authorization tokens', 'PCB layout', 'RF modulation', 'Image denoising'],
        ans: 'A',
        explanation: 'JSON Web Tokens (JWT) encode cryptographically signed claims (header, payload, signature) enabling secure, stateless client-server authentication.'
      },
      {
        q: 'A race condition occurs when:',
        options: ['Program behavior depends on timing/order of concurrent operations', 'A database has no rows', 'A resistor overheats', 'An antenna is directional'],
        ans: 'A',
        explanation: 'A race condition arises in concurrent systems when multiple threads or processes access shared state without proper synchronization, causing indeterminate outcomes.'
      },
      {
        q: 'Horizontal scaling means:',
        options: ['Adding more instances/machines to handle load', 'Increasing RAM in one machine only', 'Reducing database tables', 'Increasing CPU voltage'],
        ans: 'A',
        explanation: 'Horizontal scaling (scaling out) handles increasing traffic demands by deploying additional server nodes into a distributed cluster behind a load balancer.'
      },
      {
        q: 'A transaction with ACID properties aims to provide:',
        options: ['Reliable and consistent database operations', 'RF encryption', 'Image compression', 'Motor control'],
        ans: 'A',
        explanation: 'ACID guarantees Atomicity, Consistency, Isolation, and Durability, ensuring database transactions complete safely even during unexpected system crashes.'
      }
    ]
  }
];

const generatedQuestions = [];

eceRawData.forEach(domain => {
  ['easy', 'medium', 'hard'].forEach(diff => {
    const list = domain[diff];
    list.forEach((item, index) => {
      const qNum = index + 1;
      const qId = `q_ece_${domain.domainId}_${diff[0]}${qNum}`;
      
      const optionLetters = ['A', 'B', 'C', 'D'];
      const formattedOptions = item.options.map((optText, oIdx) => ({
        id: optionLetters[oIdx],
        optionId: optionLetters[oIdx],
        text: optText
      }));

      generatedQuestions.push({
        questionId: qId,
        branch: 'ECE',
        domainId: domain.domainId,
        domainName: domain.domainName,
        domain: domain.domainId,
        difficulty: diff,
        questionType: diff === 'easy' ? 'conceptual' : (diff === 'medium' ? 'problem_solving' : 'scenario'),
        category: domain.category,
        dimension: 'Skill & Behaviour',
        questionText: item.q,
        options: formattedOptions,
        correctOption: item.ans,
        explanation: item.explanation,
        skillDimensions: domain.skillDimensions,
        skillVariables: domain.skillDimensions,
        source: 'master-question-bank-pdf',
        active: true
      });
    });
  });
});

console.log(`Generated ${generatedQuestions.length} ECE questions across ${eceRawData.length} domains.`);

// Output module
const fileContent = `/**
 * B.E. ECE - Domain-Wise MCQ Master Question Bank
 * Sourced from B.E. ECE Domain-Wise MCQ Question Bank PDF
 * 17 domains * 15 questions each (5 Easy + 5 Medium + 5 Hard) = 255 questions total
 * All with branch: "ECE"
 */

const ECE_MASTER_QUESTION_BANK = ${JSON.stringify(generatedQuestions, null, 2)};

module.exports = {
  ECE_MASTER_QUESTION_BANK
};
`;

const outputPath = path.join(__dirname, '../seeders/seedEceMasterQuestionBank.js');
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Successfully written to ${outputPath}`);
