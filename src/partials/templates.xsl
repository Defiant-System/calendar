<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="popup-event">
	<div class="popup-event" data-area="popup">
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>

		<xsl:choose>
			<xsl:when test="@type = 'day'">
				<div class="row-head">
					<i>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="../@color"/></xsl:attribute>
					</i>
					<h3>
						<xsl:value-of select="@title"/>
					</h3>
				</div>
				<div class="row-date">
					<i class="icon-calendar"></i>
					<div>
						<span class="event-date"><xsl:value-of select="@i18n-date"/></span>
					</div>
				</div>
				<hr/>
				<div class="row-info">
					<i class="icon-info"></i>
					<div><xsl:value-of select="../@title"/></div>
				</div>
			</xsl:when>
			<xsl:otherwise>
				<div class="row-head">
					<i>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="@calId"/></xsl:attribute>
					</i>
					<h3 contenteditable="true" placeholder="New Event" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
						<xsl:if test="not(@isNew)"><xsl:value-of select="@title"/></xsl:if>
					</h3>
				</div>
				<div class="row-location">
					<i class="icon-location-pin"></i>
					<input type="text" placeholder="Add Location"/>
				</div>
				<hr/>
				<div class="row-date">
					<i class="icon-calendar"></i>
					<div>
						<span class="event-date"><xsl:value-of select="@i18n-date"/></span>
						<span class="event-starts" data-change="popup-time-change"><xsl:value-of select="@i18n-starts"/></span>
						<span>to</span>
						<span class="event-ends" data-change="popup-time-change"><xsl:value-of select="@i18n-ends"/></span>
					</div>
				</div>
				<hr/>
				<div class="row-users">
					<i class="icon-user"></i>
					<input type="text" placeholder="Add Invitees"/>
				</div>
				<hr/>
				<div class="row-attachments">
					<i class="icon-paperclip"></i>
					<input type="text" placeholder="Add Notes, URL or Attachments"/>
				</div>
			</xsl:otherwise>
		</xsl:choose>
	</div>
</xsl:template>

</xsl:stylesheet>

