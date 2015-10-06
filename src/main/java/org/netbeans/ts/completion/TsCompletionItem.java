/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.netbeans.ts.completion;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import static java.awt.SystemColor.text;
import java.awt.event.KeyEvent;
import javax.swing.text.BadLocationException;
import javax.swing.text.JTextComponent;
import javax.swing.text.StyledDocument;
import org.netbeans.api.editor.completion.Completion;
import org.netbeans.spi.editor.completion.CompletionItem;
import org.netbeans.spi.editor.completion.CompletionTask;

/**
 *
 * @author denz
 */
public class TsCompletionItem implements CompletionItem {

	int caretOffset = 0;
	String text = "";

	public TsCompletionItem() {
		
	}
	@Override
	public void defaultAction(JTextComponent jtc) {
		try {
			StyledDocument doc = (StyledDocument) jtc.getDocument();
			doc.insertString(caretOffset, text, null);
			//This statement will close the code completion box: 
			Completion.get().hideAll();
		} catch (BadLocationException ex) {
			//Exceptions.printStackTrace(ex);
			ex.printStackTrace();
		}
	}

	@Override
	public void processKeyEvent(KeyEvent evt) {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public int getPreferredWidth(Graphics g, Font defaultFont) {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public void render(Graphics g, Font defaultFont, Color defaultColor, Color backgroundColor, int width, int height, boolean selected) {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public CompletionTask createDocumentationTask() {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public CompletionTask createToolTipTask() {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public boolean instantSubstitution(JTextComponent component) {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public int getSortPriority() {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public CharSequence getSortText() {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public CharSequence getInsertPrefix() {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}
	
}
