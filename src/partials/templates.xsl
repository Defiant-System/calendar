<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="popup-event">
	<div class="popup-event">
		<h3><xsl:value-of select="@title"/></h3>
		<input type="text" placeholder="Add Location"/>
		<hr/>
		25 Feb 2021 09:15 to 11:45
		<hr/>
		<input type="text" placeholder="Add Invitees"/>
		<hr/>
		<input type="text" placeholder="Add Notes, URL or Attachments"/>
	</div>
</xsl:template>

</xsl:stylesheet>

