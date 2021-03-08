#AnalogDevices

This is some sample code produced for Chris.Ampenberger@analog.com  

He provided the following instructions

Coding Test
The objective is to simulate sending a large number of SMS alerts, like for an emergency alert service. The simulation consists of three parts:

A producer that that generates a configurable number of messages (default 1000) to random phone number. Each message contains up to 100 random characters.

A sender, who pickups up messages from the producer and simulates sending messages by waiting a random period time distributed around a configurable mean. The sender also has a configurable failure rate.

A progress monitor that displays the following and updates it every N seconds (configurable):

Number of messages sent so far

Number of messages failed so far

Average time per message so far

One instance each of producer and progress monitor will be started while a variable number of senders can be started with different mean processing time and error rate settings.

You are free in the programming language you choose, but your code should come with reasonable unit testing.

Please submit the code test at least two business days before the interview, so we have time to review it.


    