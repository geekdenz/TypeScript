/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.netbeans.ts;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.SimpleScriptContext;

/**
 *
 * @author denz
 */
public class ExecUtils {
	
	public static String pipe(String str, String command2) throws IOException, InterruptedException {
		//Process p1 = Runtime.getRuntime().exec(command1);
		//p.waitFor();
		//BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
		Process p2 = Runtime.getRuntime().exec(command2);
		p2.getInputStream().read(str.getBytes());
		p2.waitFor();
		BufferedReader reader
				= new BufferedReader(new InputStreamReader(p2.getInputStream()));
		StringBuilder sb = new StringBuilder();
		String line;
		while ((line = reader.readLine()) != null) {
			sb.append(line + "\n");
		}
		return sb.toString();
	}
	public static String exec(String commands[]) throws IOException, InterruptedException {
		Process p = Runtime.getRuntime().exec(commands);
		p.waitFor();

		BufferedReader reader
				= new BufferedReader(new InputStreamReader(p.getInputStream()));

		String line;
		String output = "";
		while ((line = reader.readLine()) != null) {
			//sb.append(line + "\n");
			output += line + "\n";
		}
		return output;
	}

	public static String tss(String filename, int line, int pos) throws IOException, InterruptedException {
		String tssJs = "/home/denz/.nvm/versions/node/v0.12.5/lib/node_modules/typescript-tools/bin/tss.js";
		return exec(new String[]{"/bin/bash", "/home/denz/bin/tssc", filename, "completions-brief true "+ line +" "+ pos});
		/*
		ScriptEngineManager manager = new ScriptEngineManager();
		ScriptEngine engine = manager.getEngineByName("js");
		try {
			FileReader reader = new FileReader(tssJs);
			ScriptContext context = new SimpleScriptContext();
			context.getWriter().write(tssJs);
			String output = engine.eval(reader, context).toString();
			reader.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
				*/
	}
}
