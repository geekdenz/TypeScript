/**
 * Tools to execute commands and get the output back.
 */
package org.netbeans.ts;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import org.openide.util.Exceptions;

public class ExecUtils {

	/**
	 * Pipe str into command2 like in a unix shell. Basically str becomes input
	 * to command2.
	 *
	 * Like echo a b c | sort "a b c" would be str "sort" would be command2.
	 *
	 * @param str the String to pass in
	 * @param command2
	 * @return output of the command
	 * @throws IOException
	 * @throws InterruptedException
	 */
	public static String pipe(String str, String command2) throws IOException, InterruptedException {
		ProcessBuilder process2 = new ProcessBuilder(command2.split(" "));
		Process process = process2.start();
		//process.waitFor(5000, TimeUnit.MILLISECONDS);
		OutputStream out = process.getOutputStream();
		out.write(str.getBytes());
		//process.waitFor(5000, TimeUnit.MILLISECONDS);
		out.close();
		process.waitFor();
		InputStreamReader isr = new InputStreamReader(process.getInputStream());
		InputStreamReader errorReader = new InputStreamReader(process.getErrorStream());
		BufferedReader br = new BufferedReader(isr);
		BufferedReader ber = new BufferedReader(errorReader);
		String line;
		String output = "";
		while ((line = br.readLine()) != null) {
			output += line + "\n";
		}
		while ((line = ber.readLine()) != null) {
			output += line + "\n";
		}
		return output;
	}

	/**
	 * Simple execute of command.
	 *
	 * @param commands Usually separated by " "
	 * @return output
	 * @throws IOException
	 * @throws InterruptedException
	 */
	public static String exec(String commands[]) throws IOException, InterruptedException {
		Process p;
		if (commands.length == 1) {
			p = Runtime.getRuntime().exec(commands[0]);
		} else {
			p = Runtime.getRuntime().exec(commands);
		}
		p.waitFor();

		BufferedReader reader
				= new BufferedReader(new InputStreamReader(p.getInputStream()));

		String line;
		String output = "";
		while ((line = reader.readLine()) != null) {
			output += line + "\n";
		}
		return output;
	}

	/**
	 * Get the output of echo 'completions...' | tss $filename
	 *
	 * @param filename Type Script filename.ts
	 * @param line to query
	 * @param pos character position
	 * @return output of the commands
	 * @throws IOException
	 * @throws InterruptedException
	 */
	public static String tss(String filename, int line, int pos) throws IOException, InterruptedException {
		String tss = "/home/denz/.nvm/versions/node/v0.12.5/bin/node /home/denz/.nvm/versions/node/v0.12.5/bin/tss";
		String str = "completions-brief true " + line + " " + pos + " " + filename + "\n";
		String command2 = tss + " " + filename;
		return pipe(str, command2);
	}

	/**
	 * Super simple testing method.
	 *
	 * @param args
	 */
	public static void main(String[] args) {
		try {
			String out = tss("/home/denz/NetBeansProjects/HTML5Application7/public_html/newTsTemplate.ts", 11, 3);
			System.out.println("OUT: " + out);
		} catch (IOException ex) {
			Exceptions.printStackTrace(ex);
		} catch (InterruptedException ex) {
			Exceptions.printStackTrace(ex);
		}
	}
}
